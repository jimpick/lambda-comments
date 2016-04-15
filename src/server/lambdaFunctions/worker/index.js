import { parse as urlParse } from 'url'
import { normalize as pathNormalize, join as pathJoin } from 'path'
import fetch from 'node-fetch'
import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'

import lambdaWrapper from '../../lib/lambdaWrapper'
import { download, upload } from '../../lib/s3'

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
        const { dirName, comments } = action
        return {
          ...state,
          [dirName]: comments
        }
      }
    case 'NEW_COMMENT':
      {
        const {
          dirName,
          submittedDate: date,
          payload: {
            commentContent,
            authorName,
            authorUrl
          }
        } = action
        const comments = state[dirName] ? [...state[dirName]] : []
        comments.push({
          date,
          authorName,
          authorUrl,
          commentContent
        })
        return {
          ...state,
          [dirName]: comments
        }
      }
    default:
      return state
  }
}

// const store = createStore(reducer, applyMiddleware(logger))
const store = createStore(reducer)

async function fetchOldComments({ dirName }) {
  const state = store.getState()
  if (state[dirName]) {
    return
  }
  const key = `${dirName}/comments.json`
  try {
    const fileData = await download({ key })
    const comments = JSON.parse(fileData.Body.toString())
    await store.dispatch({
      type: 'FETCH_OLD_COMMENTS',
      dirName,
      comments
    })
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      // It's okay if the file doesn't exist. That is normal
      // for the first post
      return
    }
    throw error
  }
}

async function downloadActionAndDispatch({ dirName, actionRef }) {
  await fetchOldComments({ dirName })
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
      data: JSON.stringify(allComments[key], null, 2),
      contentType: 'application/json'
    })
  }
}

export async function handler (...opts) {
  await lambdaWrapper(opts, async event => {
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
      // console.log(JSON.stringify(event, null, 2))
      console.log('dirName:', dirName)
      console.log('actionRef:', actionRef)
    }
    if (!dryRun) {
      await downloadActionAndDispatch({ dirName, actionRef })
    }
    await saveAllComments({ quiet })
  })
}
