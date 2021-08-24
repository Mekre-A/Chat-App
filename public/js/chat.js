const socket = io()
const weatherForm = document.querySelector('#weather')
const $messageFormInput = weatherForm.querySelector('input')
const $messageFormButton = weatherForm.querySelector('button')
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageTemplateLink = document.querySelector('#message-template-location').innerHTML
const sidebarTempalte = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})


const autoScroll = () =>{
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    console.log(newMessageMargin)

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplateLink, {
        username:message.username,
        message:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(sidebarTempalte, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


weatherForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value


    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("Message delivered!")
    })
})

$locationButton.addEventListener('click', ()=>{
    //Check if browsers support location based services
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation', {lat:position.coords.latitude, lng:position.coords.longitude}, (message)=>{
            console.log(message)
            $locationButton.removeAttribute('disabled')
        })
        
    })

    
})

socket.emit('join', {
    username,
    room
}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})