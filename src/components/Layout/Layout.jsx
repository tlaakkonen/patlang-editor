import React from 'react'
import Box from '@mui/material/Box'
import TopMenu from './TopMenu'

export default function Layout({ sidebar, children }) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* top-right menu */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1200 }}>
        <TopMenu />
      </Box>

      <Box sx={{ display: 'flex', height: '100vh' }}>
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
        <Box component="main" sx={{ flex: 1, p: 2, bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
