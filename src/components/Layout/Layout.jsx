import React from 'react'
import Box from '@mui/material/Box'
import TopMenu from './TopMenu'

export default function Layout({ sidebar, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <TopMenu />
      </Box>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box
          component="aside"
          sx={{
            width: 280,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'auto',
          }}
        >
          {sidebar}
        </Box>
        <Box
          component="main"
          sx={{ flex: 1, p: 2, bgcolor: 'background.default', overflow: 'hidden' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
