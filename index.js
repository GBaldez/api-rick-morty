const express = require('express');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
require ("dotenv").config();
require('express-async-errors');
(async () => {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    const app= express();
    app.use(express.json());
    const port = process.env.PORT || 3000;
    const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.xgee7.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    
const options = {
    useUnifiedTopology: true,
};

const client = await mongodb.MongoClient.connect(connectionString, options);
//Transformando o banco de dados e a collection em objetos.
const db = client.db("db_rickmorty");
const personagens = db.collection("personagens");

const getPersonagensValidas = () => personagens.find({}).toArray();

const getPersonagemById = async(id) => personagens.findOne({_id: ObjectId(id)});

app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Methods", "*");

    res.header(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
    );

    next();
});

app.get('/',(req, res) => {
    const teste = undefined;
    res.send({info: "Olá Blue"});
});

app.get("/personagens", async (req, res) => {
    res.send(await getPersonagensValidas());
});

app.get("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const personagem = await getPersonagemById(id);
    if(!personagem){
        res.status(404).send({error:"O personagem especificado não foi encontrado."});
        return;
    }
    res.send(personagem);
});
/*
app.post("/personagens", async (req, res) => {
    const novoPersonagem = req.body;
    if(!novoPersonagem || !novoPersonagem.nome || !novoPersonagem.imagemUrl){
        res.status(400).json({error: "Something when wrong while registering the character"})
        return;
    }
    personagens.insertOne(
        novoPersonagem,
        {
            writeConcern: novoPersonagem
        }
    )
    if (!insertCount) {
        res.send("Ocorreu um erro");
        return;
    } 
    res.send(novoPersonagem)
}); */

app.post("/personagens", async (req, res) => {
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
        res.status(400).send(
            {error: "Personagem inválido, certifique-se que tenha os campos nome e imagemUrl"}
            );
        return;
    }

    const result = await personagens.insertOne(objeto);
    
    console.log(result);
    
    if (result.acknowledged == false) {
        res.status(500).send({error: "Ocorreu um erro"});
        return;
    }

    res.status(201).send(objeto);
});

app.put("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
        res.status(400).send(
            {error: "Requisição inválida, certifique-se que tenha os campos nome e imagemUrl"}
        );
        return;
    }

    const quantidadePersonagens = await personagens.countDocuments({
        _id: ObjectId(id),
    });

    if (quantidadePersonagens !== 1) {
        res.status(404).send({error: "Personagem não encontrado"});
			return;
    }
    const result = await personagens.updateOne(
        {
            _id: ObjectId(id),
        },
        {
            $set:objeto,
        }
    )

    if (result.acknowledged == "undefined") {
        res.status(500).send({error: "Ocorreu um erro ao atualizar o personagem"});
        return;
    }
    res.send(await getPersonagemById(id));
});
      
app.delete("/personagens/:id" , async (req, res) => {
    const id = req.params.id;
    const quantidadePersonagens = await personagens.countDocuments({
        _id: ObjectId(id),
    });
    if (quantidadePersonagens !== 1 ) {
        res.status(404).send({error: "Personagem não encontrado"});
        return;
    }

    const result = await personagens.deleteOne({
        _id: ObjectId(id),
    });
    
    if (result.deletedCount !== 1) {
        res.status(500).send({error:"Ocorreu um erro ao remover o personagem"});
        return;
    }

    res.send(204);
});

app.all("*", function (req, res) {
    res.status(404).send({error:"Endpoint was not found"});
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).send ({
        error:{
            status: error.status || 500,
            message: error.message || "Internal server error",
        }
    });
});
app.listen(port, ()=> {
    console.info(`App rodando em http://localhost:${port}`)
})
})();