import mysql from 'mysql2/promise'

export class PostSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  createPost = async () => {
    const connection = await mysql.createConnection(this.configuracion)
    const sql = 'INSERT INTO posts (slug, titulo, contenido, categoriaId, imagenId, metadescription, keywords, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
    const values = [
      {
        slug: '8-consejos-para-cuidadores',
        titulo: '8 consejos para cuidadores',
        contenido: 'Éste el contenido del post',
        categoriaId: 1,
        imagenId: null,
        metadescription: '8 consejos para saber cómo mimar a nuestras mascotas correctamente',
        keywords: 'consejos, cuidados, cuidado animal',
        estado: 'borrador'
      },
      {
        slug: 'como-adiestrar-a-tu-perro',
        titulo: 'Cómo adiestrar a tu perro',
        contenido: 'Éste el contenido del post',
        categoriaId: 3,
        imagenId: null,
        metadescription: 'consejos para adiestrar a tu perro',
        keywords: 'consejos, cuidados, cuidado animal',
        estado: 'publicado'
      }
    ]
    let filasafectadas = 0

    try {
      const db = await Promise.all(
        values.map(async function (element) {
          const values = Object.values(element)
          const [result] = await connection.execute(sql, [...values])
          filasafectadas = filasafectadas + result.affectedRows
          return result
        })
      )
      console.log(`Posts creados con éxito. ${filasafectadas} fila(s) afectadas.`)
      return db
    } catch (error) {
      console.error('Error al crear los posts:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
