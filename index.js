require("dotenv").config()
const express = require("express")
const app = express()  // initiate express application
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

app.use(express.json())

app.use(cors())

app.use(express.static("build"))


morgan.token("sent_data", function (request) {
  return JSON.stringify(request.body)
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :sent_data"))



const getDate = () => {
  const date = new Date()
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const days = ["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"]
  const dayOfWeek = days[date.getDay()]
  const month = months[date.getMonth()]
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

  return (`${dayOfWeek} ${month} ${date.getDate()} ${date.getFullYear()} ${time} GMT+0200 (Eastern European Standard Time)`)
}

app.get("/info", (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<div>
        <p> Phonebook has info for ${persons.length} people </p>
        <p>${getDate()}</p>
        `)
  })
})


app.get("/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get("/persons/:id", (request, response, next) => {
  Person.findById(request.params.id).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

app.delete("/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/persons", (request, response, next) => {
  const contact = request.body

  const newContact = new Person({
    name: contact.name,
    number: contact.number
  })

  newContact.save()
    .then(savedContact => {  // save in DB then
      response.json(savedContact)  // send to back-end
    })
    .catch(error => next(error))
})

app.put("/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndPoint = (request, response) => {
  response.status(404).send({ error:"unknown endpoint" })
}

app.use(unknownEndPoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === "CastError"){
    return response.status(400).send({ error:"malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.errors })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
