const express = require('express');
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

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

const getPersonagemById = async(id) => personagens.findOne({_id: ObjectId(id)});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const personagem = await getPersonagemById(id);
    if(!personagem){
        res.status(404).send({error:"O personagem especificado não foi encontrado."});
        return;
    }
    res.send(personagem);
});
})();

module.exports = router;