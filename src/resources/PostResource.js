/**
 * It return the post with no sensible properties
 * @param {PostSchema[] | PostSchema} post The post whose properties will be protected
 * @returns {PostSchema[] | PostSchema}
 */
export const postsProtected = ({ posts }) => {
  if (Array.isArray(posts)) {
    const protectedPosts = []
    posts.forEach(post => {
      protectedPosts.push({
        id: post.id,
        slug: post.slug,
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: post.categoria,
        imagen: post.imagen,
        metadescripcion: post.metadescripcion,
        keywords: post.keywords,
        estado: post.estado,
        created_at: post.created_at
      })
    })
    return protectedPosts
  } else {
    const protectedPost = {
      id: posts.id,
      slug: posts.slug,
      titulo: posts.titulo,
      contenido: posts.contenido,
      categoria: posts.categoria,
      imagen: posts.imagen,
      metadescripcion: posts.metadescripcion,
      keywords: posts.keywords,
      estado: posts.estado,
      created_at: posts.created_at
    }
    return protectedPost
  }
}
