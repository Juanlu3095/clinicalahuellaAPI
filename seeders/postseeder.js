import mysql from 'mysql2'

export class PostSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  createPost = () => {
    const connection = mysql.createConnection(this.configuracion)
    const sql = 'INSERT INTO posts (slug, titulo, contenido, categoria, imagen, metadescripcion, keywords, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
    const values = [
      '5-consejos-para-cuidadores', '5 consejos para cuidadores', 'Éste el contenido del post', 1, 2,
      '5 consejos para saber cómo mimar a nuestras mascotas correctamente', 'consejos, cuidados, cuidado animal', 'borrador'
    ]

    return new Promise((resolve, reject) => {
      connection.execute(sql, values, (err, result, fields) => {
        if (err) {
          console.error('Error al crear los posts:', err)
          reject(err)
        }
        console.log(`Posts creados con éxito. ${result.affectedRows} fila(s) creadas.`)
        resolve(result)
      })
      connection.end()
    })
  }
}
