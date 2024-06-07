const express = require("express")
const socket = require("socket.io")
const http = require("http")
const { Chess } = require("chess.js")

const path = require("path")
const { Socket } = require("dgram")

const app =express()

const server = http.createServer(app)
const io = socket(server)

let chess = new Chess();
let Players = {}
let currentPlayer = "w"


app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname , "public")))


app.get("/",(req,res)=>{
    res.render("index")
})

io.on("connection", function (uniqueSocket) {
    console.log("connected")

    // uniqueSocket.on("chacha" , function(){
    //     // console.log("chacha aa gye ")
    //     io.emit("chacha gye")
    // })

    // uniqueSocket.on("disconnect",function(){
    //     console.log("Disconnected")
    // })

    if(!Players.white){
        Players.white = uniqueSocket.id
        uniqueSocket.emit("playerRole" , "w")
    } else if(!Players.black){
        Players.black = uniqueSocket.id
        uniqueSocket.emit("playerRole", "b")
    } else{
        uniqueSocket.emit("spectatorRole")
    }

    uniqueSocket.on("disconnect",function(){
        if(uniqueSocket.id === Players.white){
            delete Players.white
        }
        else if(uniqueSocket.id === Players.black){
            delete Players.black
        }
        console.log("disconnect ho gya re baba ")
    })

    uniqueSocket.on("move",function(move){
        try {
            if(chess.turn() === "w" && uniqueSocket.id !== Players.white) return
            if(chess.turn() === "b" && uniqueSocket.id !== Players.black) return

            const result = chess.move(move)
            console.log(result)
            if(result){
                currentPlayer = chess.turn()
                io.emit("move" , move)
                io.emit("boardState" , chess.fen())
            }else{
                console.log("Invalid move :",move)
                Socket.emit("Invalid move :",move)
            }

        } catch (error) {
            console.log("Error occur ", error)            
        }
    })
})


server.listen(3000)