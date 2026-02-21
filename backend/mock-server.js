const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const mockFiles = [
  { _id: '1', name: 'Documents', isDirectory: true, path: '/Documents', parentId: null, size: null, updatedAt: '2024-09-09T10:30:00Z' },
  { _id: '2', name: 'Pictures', isDirectory: true, path: '/Pictures', parentId: null, size: null, updatedAt: '2024-09-09T11:00:00Z' },
  { _id: '3', name: 'Pic.png', isDirectory: false, path: '/Pictures/Pic.png', parentId: '2', size: 2048, updatedAt: '2024-09-08T16:45:00Z' },
  { _id: '4', name: 'Vacation', isDirectory: true, path: '/Pictures/Vacation', parentId: '2', size: null, updatedAt: '2024-09-07T14:00:00Z' },
  { _id: '5', name: 'Report.pdf', isDirectory: false, path: '/Documents/Report.pdf', parentId: '1', size: 15360, updatedAt: '2024-09-06T09:15:00Z' }
]

app.get('/api/file-system', (req, res) => {
  res.status(200).json(mockFiles)
})

app.post('/api/file-system/folder', (req, res) => {
  const { name, parentId } = req.body
  const id = String(Date.now())
  const parent = mockFiles.find(f => f._id === parentId)
  const parentPath = parent ? parent.path : ''
  const newPath = parentPath ? `${parentPath}/${name}` : `/${name}`
  const folder = { _id: id, name, isDirectory: true, path: newPath, parentId: parentId || null, size: null, updatedAt: new Date().toISOString() }
  mockFiles.push(folder)
  res.status(201).json(folder)
})

app.post('/api/file-system/upload', (req, res) => {
  const id = String(Date.now())
  const file = { _id: id, name: req.body?.name || 'uploaded-file', isDirectory: false, path: `/Documents/${req.body?.name || 'file'}`, parentId: req.body?.parentId || '1', size: 1024, updatedAt: new Date().toISOString() }
  mockFiles.push(file)
  res.status(201).json(file)
})

app.listen(3000, () => console.log('Mock server on http://localhost:3000'))
