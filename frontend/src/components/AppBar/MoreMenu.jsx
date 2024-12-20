import { useState } from 'react'
import { Box, Button, Menu, MenuItem, Divider, useTheme } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'

function MoreMenu() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const theme = useTheme()
  const menuBackgroundColor = theme.palette.mode === 'dark' ? '#2c3e50' : '#1A3636'

  return (
    <Box>
      
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-more',
          sx: {
            display: 'block',
            padding: 0,
            backgroundColor: menuBackgroundColor,
            color: 'white'
          }
        }}
      >
        
        <Divider />
      </Menu>
    </Box>
  )
}

export default MoreMenu
