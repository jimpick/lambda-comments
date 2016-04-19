import { parse as urlParse } from 'url'
import { normalize as pathNormalize, join as pathJoin } from 'path'
import fetch from 'node-fetch'
import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import moment from 'moment'
import { download, upload } from '../../lib/s3'

let invocationCounter = 0

const initialState = {}

const logger = createLogger({
  colors: {
    title: false,
    prevState: false,
    action: false,
    nextState: false,
    error: false
  }
})

function reducer (state = initialState, action) {
  switch (action.type) {
    case 'FETCH_OLD_COMMENTS':
      {
        const { dirName, comments, timestamp } = action
        return {
          ...state,
          [dirName]: {
            timestamp,
            comments,
          }
        }
      }
    case 'NEW_COMMENT':
      {
        const {
          dirName,
          submittedDate: date,
          payload: {
            id,
            commentContent,
            authorName,
            authorUrl
          }
        } = action
        const comments = state[dirName] ? [...state[dirName].comments] : []
        const timestamp = moment.utc()
        comments.push({
          id,
          date,
          authorName,
          authorUrl,
          commentContent
        })
        return {
          ...state,
          [dirName]: {
            timestamp,
            comments,
          }
        }
      }
    default:
      return state
  }
}

// const store = createStore(reducer, applyMiddleware(logger))
const store = createStore(reducer)

async function fetchOldComments({ dirName, quiet }) {
  const state = store.getState()
  if (state[dirName] &&
      moment().subtract(20, 'seconds').isBefore(state[dirName].timestamp)) {
    // Use cache if it's under 20 seconds old
    if (!quiet) {
      console.log('Using cached old comments')
    }
    return
  }
  const key = `${dirName}/comments.json`
  try {
    if (!quiet) {
      console.log('Loading old comments from S3')
    }
    const fileData = await download({ key })
    const { LastModified: lastModified } = fileData
    const timestamp = moment.utc(new Date(lastModified))
    const comments = JSON.parse(fileData.Body.toString())
    await store.dispatch({
      type: 'FETCH_OLD_COMMENTS',
      dirName,
      comments,
      timestamp
    })
  } catch (error) {
    // For some reason, when there is no file in S3, we get an 'NoSuchKey'
    // error when running from the developer account, but an 'AccessDenied'
    // when running on Lambda
    if (error.code === 'NoSuchKey' || error.code === 'AccessDenied') {
      // It's okay if the file doesn't exist. That is normal
      // for the first post
      if (!quiet) {
        console.log('No old comments found')
      }
      const timestamp = moment.utc()
      const comments = []
      await store.dispatch({
        type: 'FETCH_OLD_COMMENTS',
        dirName,
        comments,
        timestamp
      })
      return
    }
    throw error
  }
}

async function downloadActionAndDispatch({ dirName, actionRef, quiet }) {
  await fetchOldComments({ dirName, quiet })
  const key = `${dirName}/.actions/${actionRef}/action.json`
  const fileData = await download({ key })
  const action = JSON.parse(fileData.Body.toString())
  await store.dispatch({ ...action, dirName })
}

async function saveAllComments ({ quiet }) {
  const allComments = store.getState()
  for (const key in allComments) {
    if (!quiet) {
      console.log('Saving', key)
    }
    await upload({
      key: `${key}/comments.json`,
      data: JSON.stringify(allComments[key].comments, null, 2),
      contentType: 'application/json'
    })
  }
}

export async function handler (event, context, callback) {
  if (!callback) {
    const errorMessage = 'Requires Node 4.3 or greater on Lambda'
    console.log(errorMessage)
    context.error(context.fail(errorMessage))
    return
  }
  try {
    // console.log('Event', JSON.stringify(event, null, 2))
    const {
      Records: [
        {
          dynamodb: {
            NewImage: {
              actionRef: {
                S: actionRef
              },
              dirName: {
                S: dirName
              }
            }
          }
        }
      ],
      quiet,
      dryRun
    } = event
    if (!quiet) {
      console.log('Invocation count:', ++invocationCounter)
      // console.log(JSON.stringify(event, null, 2))
      console.log('dirName:', dirName)
      console.log('actionRef:', actionRef)
    }
    if (!dryRun) {
      await downloadActionAndDispatch({ dirName, actionRef, quiet })
    }
    await saveAllComments({ quiet })
    callback( null, { success: true } )
  } catch (error) {
    // console.log('Worker error', error)
    // console.log(error.stack)
    callback(error)
  }
}
