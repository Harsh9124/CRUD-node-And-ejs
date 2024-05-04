const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const multer = require('multer');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

//for storing the image in the database
const storage = multer.memoryStorage();
const upload = multer({ storage });


//store the data in the database middleware is used to store the image in the database
app.post('/create', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const { name, email, age } = req.body;
    const img = req.file.buffer;
    const newUser = await userModel.create({ name, email, age, img: img });
    res.redirect('read');
})

//display the data from the database
app.get('/read', async (req, res) => {
    const users = await userModel.find();
    res.render('read', { users });
});

//display the image from the database here we are using the id of the user to display the image 
//so that we can display the image of the user whose id is passed in the url in map function in read.ejs
app.get('/image/:id', async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).send('No user found');
        }
        res.set('Content-Type', 'image/jpeg');
        res.send(user.img);
    } catch (error) {
        res.status(500).send('No user found');
    }
});

//showing specific user data to update
app.get('/edit/:id', async (req, res) => {
    const user = await userModel.findById(req.params.id);
    res.render('update', { user });
});

//update the data in the database
app.post('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, email, age } = req.body;

        // Check if req.file exists and has buffer property if it is there then store the image data in imageData
        //if not it will stay empty
        const imageData = req.file ? { img: req.file.buffer } : {};

        //if imagedata obj is empty findByIdAndUpdate will ignore it alse it will update the image data
        await userModel.findByIdAndUpdate(req.params.id, { name, email, age, ...imageData });
        res.redirect('/read');
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//delete the data from the database
app.get('/delete/:id', async (req, res) => {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect('/read');
});

app.listen(3000);