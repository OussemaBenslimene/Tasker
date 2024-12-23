import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI, deleteCardDetailsAPI } from '~/apis'
import {
  updateCardInBoard,
  deleteCardInBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import { useConfirm } from 'material-ui-confirm'
import ChecklistModal from './ChecklistModal'
import CardChecklistSection from './CardChecklistSection'

import LabelPopover from './LabelPopover'
import CardLabelSection from './CardLabelSection'

import { styled } from '@mui/material/styles'
import { Popover } from '@mui/material'
import AttachmentModal from './AttachmentModal'
import CardAttachmentSection from './CardAttachmentSection'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))


function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)

  const handleCloseModal = () => {
    dispatch(clearAndHideCurrentActiveCard())
  }

  // Get the title of the column from activeBoard.columns
  const getColumnTitle = (columnId) => {
    const column = activeBoard.columns.find(col => col._id === columnId);
    return column ? column.title : 'Unknown List';  // Default to 'Unknown List' if not found
  };

  const confirmDeleteCard = useConfirm()
  const handleDeleteCard = () => {
    confirmDeleteCard({
      title: 'Delete Card?',
      description:
        'This action will permanently delete your Card! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      .then(() => {
        const cardId = activeCard?._id
        dispatch(deleteCardInBoard(activeCard))

        dispatch(clearAndHideCurrentActiveCard())

        deleteCardDetailsAPI(cardId).then(() => {
          toast.success('Card deleted successfully!')
        })
      })
      .catch(() => { })
  }

  const callApiUpdateCard = async (updatedData) => {
    const updatedCard = await updateCardDetailsAPI(
      activeCard?._id,
      updatedData
    )

    dispatch(updateCurrentActiveCard(updatedCard))

    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUploadCardCover = (event) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    toast.promise(
      callApiUpdateCard(reqData).finally(() => (event.target.value = '')),
      { pending: 'Updating...' }
    )
  }
  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }


  const onChecklistCreated = (response) => {

    const updatedCard = {
      ...activeCard,
      checklists: response.checklists
    }

    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))
  }

  const onUpdateCardChecklist = (updatedChecklists) => {

    dispatch(updateCurrentActiveCard(updatedChecklists))
    dispatch(updateCardInBoard(updatedChecklists))
  }

  const onAttachmentCreated = (updatedAttachments) => {
    onUpdateCardAttachments(updatedAttachments);

    dispatch(updateCurrentActiveCard(updatedAttachments));
    dispatch(updateCardInBoard(updatedAttachments));
  };

  const onUpdateCardAttachments = (updatedAttachments) => {

    dispatch(updateCurrentActiveCard(updatedAttachments));
    dispatch(updateCardInBoard(updatedAttachments));
  };


  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'labels-popover' : undefined
  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)

  }

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal} 
      sx={{ overflowY: 'auto' }}
    >
      <>
        <Box
          sx={{
            position: 'relative',
            width: 900,
            maxWidth: 900,
            bgcolor: 'white',
            boxShadow: 24,
            borderRadius: '8px',
            border: 'none',
            outline: 0,
            padding: '40px 20px 20px',
            margin: '50px auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              cursor: 'pointer'
            }}
          >
            <CancelIcon
              color="error"
              sx={{ '&:hover': { color: 'error.light' } }}
              onClick={handleCloseModal}
            />
          </Box>

          {activeCard?.cover && (
            <Box sx={{ mb: 4 }}>
              <img
                style={{
                  width: '100%',
                  height: '320px',
                  borderRadius: '6px',
                  objectFit: 'cover'
                }}
                src={activeCard?.cover}
                alt="card-cover"

              />
            </Box>
          )}

          <Box
            sx={{
              mb: 1,
              mt: -3,
              pr: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CreditCardIcon />

            <ToggleFocusInput
              inputFontSize="22px"
              value={activeCard?.title}
              onChangedValue={onUpdateCardTitle}
            />
          </Box>

          {activeCard?.columnId && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
                in list{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 'bold',           
                    fontSize: '16px',             // Increases the font size slightly
                    color: 'primary.main',        
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',  // Adds subtle background highlight
                    padding: '4px 8px',           
                    borderRadius: '4px',          // Rounds the background corners
                    display: 'inline-block',      
                    marginBottom: '24px',          // Adds space below the box
                    border: '1px solid #ccc',     // Adds a border to form the rectangle
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {getColumnTitle(activeCard.columnId)}
                </Box>
              </Typography>
            </Box>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} sm={9}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}
                >
                  Labels
                </Typography>
                <CardLabelSection
                  popoverId={popoverId}
                  handleTogglePopover={handleTogglePopover}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}
                >
                  Members
                </Typography>

                <CardUserGroup
                  cardMemberIds={activeCard?.memberIds}
                  onUpdateCardMembers={onUpdateCardMembers}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SubjectRoundedIcon />
                  <Typography
                    variant="span"
                    sx={{ fontWeight: '600', fontSize: '20px' }}
                  >
                    Description
                  </Typography>
                </Box>

                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                {activeCard?.attachments?.length > 0 && (
                  <CardAttachmentSection
                    cardId={activeCard?._id}
                    cardAttachmentProp={activeCard?.attachments}
                    handleUpdateCardAttachments={onUpdateCardAttachments}
                  />
                )}
              </Box>

              {/* Checklist Section */}
              <Box sx={{ mb: 3 }}>
                <CardChecklistSection
                  cardId={activeCard?._id}
                  cardChecklistProp={activeCard?.checklists}
                  handleUpdateCardChecklist={onUpdateCardChecklist}
                />
              </Box>


              {/* Activity Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DvrOutlinedIcon />
                  <Typography
                    variant="span"
                    sx={{ fontWeight: '600', fontSize: '20px' }}
                  >
                    Activity
                  </Typography>
                </Box>

                <CardActivitySection
                  cardComments={activeCard?.comments}
                  onAddCardComment={onAddCardComment}
                />
              </Box>
            </Grid>

            {/* Right side */}
            <Grid xs={12} sm={3}>
              <Typography
                sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}
              >
                Add To Card
              </Typography>
              <Stack direction="column" spacing={1}>
                {!activeCard?.memberIds?.includes(currentUser?._id) && (
                  <SidebarItem
                    className="active"
                    onClick={() =>
                      onUpdateCardMembers({
                        userId: currentUser?._id,
                        action: CARD_MEMBER_ACTIONS.ADD
                      })
                    }
                  >
                    <PersonOutlineOutlinedIcon fontSize="small" />
                    Join
                  </SidebarItem>
                )}

                <SidebarItem className="active" component="label">
                  <ImageOutlinedIcon fontSize="small" />
                  Cover
                  <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
                </SidebarItem>

                <AttachmentModal
                  cardId={activeCard?._id}
                  attachments={activeCard?.attachments || []}
                  onAttachmentCreated={onAttachmentCreated}
                />


                <SidebarItem onClick={handleTogglePopover}>
                  <LocalOfferOutlinedIcon fontSize="small" />
                  Labels
                </SidebarItem>

                <ChecklistModal
                  cardId={activeCard?._id}
                  onChecklistCreated={onChecklistCreated}
                />

                
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography
                sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}
              >
                Actions
              </Typography>
              <Stack direction="column" spacing={1}>
                
                <SidebarItem
                  onClick={() => handleDeleteCard()}
                  sx={{
                    '&:hover': {
                      color: 'warning.dark',
                      '& .delete-forever-icon': {
                        color: 'warning.dark'
                      }
                    }
                  }}
                >
                  <DeleteForeverIcon
                    className="delete-forever-icon"
                    fontSize="small"
                  />
                  Delete
                </SidebarItem>
                
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Popover
          id={popoverId}
          open={isOpenPopover}
          anchorEl={anchorPopoverElement}
          onClose={handleTogglePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <LabelPopover />
        </Popover>
      </>
    </Modal>
  )
}

export default ActiveCard
