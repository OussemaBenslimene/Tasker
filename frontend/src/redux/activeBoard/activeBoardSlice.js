import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { isEmpty } from 'lodash'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceholderCard } from '~/utils/formatters'
import { mapOrder } from '~/utils/sorts'

const initialState = {
  currentActiveBoard: null
}

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)

    return response.data
  }
)


export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      const board = action.payload

     
      state.currentActiveBoard = board
    },

    updateCardInBoard: (state, action) => {
      
      const incommingCard = action.payload
      const column = state.currentActiveBoard.columns.find(column => column._id === incommingCard.columnId)
      if (column) {
        const card = column.cards.find(card => card._id === incommingCard._id)
        if (card) {
          Object.keys(incommingCard).forEach(key => {
            card[key] = incommingCard[key]
          })
        }
      }
    },

    deleteCardInBoard: (state, action) => {
      const deleteCard = action.payload

      const column = state.currentActiveBoard.columns.find(column => column._id === deleteCard.columnId)
      if (column) {
        const cardIndex = column.cards.findIndex(card => card._id === deleteCard._id)
        if (cardIndex > -1) {
          column.cards.splice(cardIndex, 1)
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      let board = action.payload

      board.FE_allUsers = board.owners.concat(board.members)

      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      state.currentActiveBoard = board
    })
  }
})

export const { updateCurrentActiveBoard, updateCardInBoard, deleteCardInBoard } = activeBoardSlice.actions

export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

export const activeBoardReducer = activeBoardSlice.reducer
