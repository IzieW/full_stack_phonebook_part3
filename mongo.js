const mongoose = require("mongoose")

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
  }
  
  const password = process.argv[2]

  const url = `mongodb+srv://fullstack:${password}@cluster1.lt5mczg.mongodb.net/phoneBook?retryWrites=true&w=majority`

  // define scheme and model for contacts

  const personSchema = new mongoose.Schema({
      name: String, 
      number: Number,
  })

  const Person = mongoose.model("Person", personSchema)

  mongoose
    .connect(url)
    .then( (result) => {
        if (process.argv.length ===3){
            console.log("phonebook:")
        Person.find({}).then(result => {
            result.forEach(person => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
        }) } else {
            const newPerson = new Person({
                name: process.argv[3],
                number: process.argv[4]
            })

            newPerson.save().then(result => {
                console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
                mongoose.connection.close()
            })
        }
    })


