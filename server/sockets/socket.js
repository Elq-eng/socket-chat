const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')
const { crearMensajes } = require('../utilidades/utilidades')

const UsuariosClass = new Usuarios()


io.on('connection', (client) => {

   client.on('entrarChat', ( data, callback ) => {

    if ( !data.nombre || !data.sala ){
        return callback({
            error: true,
            mensaje: 'Debes ingresar un nombre'
        })
    }

    client.join(data.sala)
    
    UsuariosClass.agregarPersona( client.id, data.nombre, data.sala )

    client.broadcast.to( data.sala ).emit('listarPersona', UsuariosClass.getPersonasPorSala( data.sala ))

    callback( UsuariosClass.getPersonasPorSala( data.sala ) )
   })

   // crear mensajes

   client.on('crearMensaje', ( data )=> {

    let persona = UsuariosClass.getPersona( client.id )

    let mensaje = crearMensajes( persona.nombre, data.mensaje)
    client.broadcast.to( persona.sala ).emit('crearMensaje', mensaje)
   })


   //persona que se desconecto 
   client.on('disconnect', () => {
    let personaBorrada = UsuariosClass.borrarPersonas( client.id  )

    console.log( personaBorrada )

    client.broadcast.to( personaBorrada[0].sala ).emit('crearMensaje', crearMensajes( 'Administrador', `${personaBorrada[0].nombre} este usuario se desconecto` ))
    client.broadcast.to( personaBorrada[0].sala ).emit('listarPersona', UsuariosClass.getPersonasPorSala( personaBorrada[0].sala ))

   })

   //mensajes privados 
   client.on('mensajePrivado', ( data ) => {

    let persona = UsuariosClass.getPersona( client.id )

    client.broadcast.to( data.para ).emit('mensajePrivado', crearMensajes( persona.nombre, data.mensaje))

   })

});