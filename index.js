require('dotenv').config()
const express = require('express')
const Note = require('./models/note')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
   Note.findById(request.params.id)
     .then(note => {
      if (note) {
        response.json(note)
      }
      else {
        response.status(404).end()
      }
     })
     .catch(error => {
       next(error)
     })
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => {
        next(error)
      })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body
  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }
      note.content = content
      note.important = important
      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => {
      next(error)
    })
})


// ERROR HANDLER

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
    next(error)
  }
  else if (error.name === 'ValidationError'){
    return response.status(400).json({
      error: error.message
    })
  }
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})