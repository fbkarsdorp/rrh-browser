var lunr = require('./lunr.js'),
    fs = require('fs')

var idx = lunr(function () {
  this.ref('idnumber')
  this.field('title', { boost: 10 })
  this.field('author', { boost: 100 })
  this.field('body')
  this.field('collaborator')
  this.field('year')
})

fs.readFile('./RRH.json', function (err, data) {
  if (err) throw err

  var raw = JSON.parse(data)

  var stories = raw.stories.map(function (q) {
    return {
      idnumber: q.idnumber,
      title: q.title,
      body: q.body,
      year: q.year,
      author: q.author,
      collaborator: q.collaborator
    }
  })

  stories.forEach(function (story) {
    idx.add(story)
  })

  fs.writeFile('./RRH_index.json', JSON.stringify(idx), function (err) {
    if (err) throw err
    console.log('done')
  })
})