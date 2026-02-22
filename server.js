import app from './src/app.js'

app.listen({ port: Number(process.env.PORT) || 3000 }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
