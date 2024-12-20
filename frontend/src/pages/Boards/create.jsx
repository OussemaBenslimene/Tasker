import { useState } from 'react'
import Box from '@mui/material/Box'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { useForm } from 'react-hook-form'
import { createNewBoardAPI } from '~/apis'
import CreateModal from '~/components/AppBar/CreateModal'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300]
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e9f2ff'
  }
}))

const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}


function SidebarCreateBoardModal({ afterCreateNewBoard }) {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm()

  const [isOpen, setIsOpen] = useState(false)
  const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => {
    setIsOpen(false)
    reset()
  }

  const [backgroundImageFile, setBackgroundImageFile] = useState(null)

  const submitCreateNewBoard = async (data) => {
    const { title, description, type } = data;

    let reqData = new FormData();
    reqData.append('title', title);  
    reqData.append('description', description);  // Appending description
    reqData.append('type', type);  // Appending type (Public/Private)

    // If there is a background image file, append it to FormData
    if (backgroundImageFile) {
      reqData.append('boardCover', backgroundImageFile);
    }

    await createNewBoardAPI(reqData).then(() => {
      // Close the modal
      handleCloseModal();
      afterCreateNewBoard();
    }).catch((error) => {
      console.error("Error creating new board:", error);
    });
  }


  return (
    <>
      <SidebarItem onClick={handleOpenModal}>
        <LibraryAddIcon fontSize="small" />
        Create a new board
      </SidebarItem>

      <CreateModal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        control={control}
        register={register}
        handleSubmit={handleSubmit}
        reset={reset}
        errors={errors}
        submitCreateNewBoard={submitCreateNewBoard}
        setBackgroundImageFile={setBackgroundImageFile}
      />
    </>
  )
}

export default SidebarCreateBoardModal