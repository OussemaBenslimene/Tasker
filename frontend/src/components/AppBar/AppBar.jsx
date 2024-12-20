import { useState } from 'react'
import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import { Button } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import Profiles from './Menus/Profiles'
import SearchIcon from '@mui/icons-material/Search'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { useMediaQuery } from '@mui/material'
import MoreMenu from './MoreMenu'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notification'
import { useForm } from 'react-hook-form'
import { createNewBoardAPI } from '~/apis'
import CreateModal from '~/components/AppBar/CreateModal'
import { useNavigate } from 'react-router-dom'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'

function AppBar() {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'))
  const isSmallScreen1 = useMediaQuery('(max-width: 1050px)');

  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navigate = useNavigate()

  const toggleSearch = () => {
    setIsSearchOpen(true)
  }

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
    reqData.append('description', description); 
    reqData.append('type', type);  

    
    if (backgroundImageFile) {
      reqData.append('boardCover', backgroundImageFile);
    }

    
    await createNewBoardAPI(reqData).then((response) => {
      
      handleCloseModal();

     
      navigate(`/boards/${response._id}`);

    }).catch((error) => {
     
      console.error("Error creating new board:", error);
    });
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50' : '#1A3636')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
       
        <Link to="/boards">
          <Tooltip title="Boards List">
            <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
          </Tooltip>
        </Link>

       
        <Link to="/">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.3, md: 0.5 }, flexShrink: 0 }}>
            <SvgIcon
              component={TrelloIcon}
              fontSize="small"
              inheritViewBox
              sx={{ color: 'white', fontSize: { xs: '1rem', md: '1.5rem' } }}
            />
            <Typography
              variant="span"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 'bold',
                color: 'white',
                display: isSmallScreen1 ? 'none' : { xs: 'none', sm: 'inline-block' },
              }}
            >
              Tasker
            </Typography>
          </Box>
        </Link>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
         
          <Button
            sx={{
              color: 'white',
              border: 'none',
              '&:hover': { border: 'none' }
            }}
            variant='outlined'
            startIcon={<LibraryAddIcon />}
            onClick={handleOpenModal}
          >
            Create
          </Button>
        </Box>

        
        {isSmallScreen && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            
            <Button
              sx={{
                color: 'white',
                border: 'none',
                '&:hover': { border: 'none' }
              }}
              variant='outlined'
              onClick={handleOpenModal}
              startIcon={<LibraryAddIcon />}></Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        
        {!isSearchOpen ? (
          <SearchIcon
            sx={{ color: 'white', cursor: 'pointer' }}
            onClick={toggleSearch}
          />
        ) : <AutoCompleteSearchBoard setIsSearchOpen={setIsSearchOpen} />
        }

        
        <ModeSelect />

        
        <Notifications />

        
        <Profiles />
      </Box>

      
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

    </Box>
  )
}

export default AppBar
