
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());
const port = 8000;

// เก็บ user ที่ส่งมาจาก client
let users = [];

let conn = null;

/*
GET /users สำหรับ get ข้อมูล user ทั้งหมด
POST /user สำหรับสร้าง user ใหม่บันทึกเข้าไป
GET /user/:id สำหรับ get ข้อมูล user รายคนที่ต้องการ
*/
const initmysql = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user:'root',
        password: 'root',
        database: 'webdb',
        port: 8830
    })
}

const validateData = (userData) => {
    let errors = []
    if(!userData.firstName) {
        errors.push('กรุณากรอกชื่อ')
    }
    if(!userData.lastName) {
        errors.push('กรุณากรอกนามสกุล')
    }
    if(!userData.age) {
        errors.push('กรุณากรอกอายุ')
    }
    if(!userData.gender) {
        errors.push('กรุณาเลือกเพศ')
    }
    if(!userData.interests) {
        errors.push('กรุณาเลือกความสนใจ')
    }
    if(!userData.description) {
        errors.push('กรุณากรอกข้อมูลตัวเอง')
    }
    return errors
}


/*app.get('/testdb-new', async (req, res) => {

    try {
        const results = await conn.query('SELECT * FROM users')
        res.json(results[0]) // ส่งข้อมูลกลับไปที่ results ในรูปแบบ json
    } catch (error) { 
        console.log('Erro fetching users:', error.message)
        res.status(500).json({error:'Error fetching users'})
        
    }
    
})*/

// path = GET /users
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users')
    res.json(results[0]);
});

// path = POST /user
app.post('/users', async (req, res) => {
    try{

        let user = req.body;
        const errors = validateData(user);
        if(errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            }
        }

        const results = await conn.query('INSERT INTO users SET ?', user)
        res.json({
            message: 'User created',
            data: results[0]
        })
    }catch(error){
         // ถ้าเกิด error ให้ส่งข้อมูลกลับไปที่ client
        const errorMessage = error.message || 'something went wrong'
        const errors = error.errors || []
        console.error('errorMessage',error.message)
        res.status(500).json({
            message: errorMessage,
            errors: errors
        }) // ส่งข้อมูลกลับไปที่ results ในรูปแบบ json
    }

});
// path = GET /users/:id สำหรับ get user รายคนที่ต้องการดู
app.get('/users/:id', async(req, res) => {
    try{
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id)
        if (results[0].length == 0) {
            throw {statusCode: 404, message: 'User not found'}
        }
        res.json(results[0][0])
    } catch (error) {
        console.error('errorMessage',error.message)
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
           message: 'something went wrong',
           errorMessage: error.message
        })
    }
})


// path = PUT /user/:id
app.put('/users/:id', async(req, res) => {
    try{
        let id = req.params.id;
        let updateUser = req.body;
        const results = await conn.query(
            'UPDATE users SET ? WHERE id = ?', 
            [updateUser, id]
        )
        res.json({
            message: 'Update user Completed',
            data: results[0]
        })
    }catch(error){
        console.error('errorMessge',error.message)
        res.status(500).json({
            message: 'something went wrong',
            errorMessge: error.message
        })
    }
});


// path = DELETE /user/:id
app.delete('/users/:id', async(req, res) => {
    try{
        let id = req.params.id;
        const results = await conn.query('DELETE From users  WHERE id = ?',id)
        res.json({
            message: 'Delete user Completed',
            data: results[0]
        })
    }catch(error){
        console.error('errorMessge',error.message)
        res.status(500).json({
            message: 'something went wrong',
            errorMessge: error.message
        })
    }
});

app.listen(port, async(req, res) => {
    await initmysql();
    console.log('Server is running on port' + port);
});
