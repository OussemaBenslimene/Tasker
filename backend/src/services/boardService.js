import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ObjectId } from 'mongodb'

const createNew = async (userId, reqBody, backgroundImage) => {
  try {
    let backgroundUrl = null
    if (backgroundImage) {
      backgroundUrl = await await CloudinaryProvider.streamUpload(backgroundImage.buffer, 'board-covers')
    }

    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
      backgroundImageUrl: backgroundUrl ? backgroundUrl.secure_url : null
    }

    const createdBoard = await boardModel.createNew(userId, newBoard)

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

   
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody, backgroundImage) => {
  try {
    if (backgroundImage) {
      const backgroundUrl = await CloudinaryProvider.streamUpload(backgroundImage.buffer, 'board-covers')
      reqBody.backgroundImageUrl = backgroundUrl.secure_url
    }

    if (reqBody.labels) {
      reqBody.labels = reqBody.labels.map(label => {
        return {
          ...label,
          _id: label._id || new ObjectId().toString()
        }
      })
    }

    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: 'Successfully' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return results
  } catch (error) { throw error }
}

const deleteBoard = async (userId, boardId) => {
  try {
    // Check if the board exists before attempting to delete it
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Delete the board
    const deletionResult = await boardModel.deleteBoard(userId, boardId)
    // Return a success message or relevant data
    return { message: 'Board successfully deleted', deletionResult }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteBoard
}
