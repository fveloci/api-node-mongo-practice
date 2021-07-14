const express = require('express');
const Course = require('../models/course_model')
const route = express.Router();
const verifyToken = require('../middlewares/auth')

route.get('/', verifyToken, (req, res) => {
    
    let courses = listCourses();
    courses.then(courses => {
        res.json({
            courses
        })
    }).catch(err => {
        res.status(400).json({
            err
        })
    })
})

route.post('/', verifyToken, (req, res) => {
    let result = createCourse(req);

    result.then(course => {
        res.json({
            course
        })
    }).catch(e => {
        res.status(400).json({
            error: e
        })
    })
})
route.put('/:id', verifyToken, (req, res) => {
    let result = updateCourse(req.params.id, req.body);
    result.then(course => {
        res.json({
            course 
        })
    }).catch(e => {
        res.status(400).json({
            e
        })
    }) 
})
route.delete('/:id', verifyToken, (req, res) => {
    let result = disableCourse(req.params.id);
    result.then(course => {
        res.json({
            course
        })
    }).catch(err => {
        res.status(400).json({
            err
        })
    })
})

async function listCourses(){
    let courses = await Course
                            .find({"state": true})
                            .populate({path: 'autor', select: 'name email -_id'});
    return courses;
}
async function createCourse(req){
    let course = new Course({
        title       : req.body.title,
        autor       : req.user._id,
        description : req.body.description       
    });
    return await course.save();
}
async function updateCourse(id, body){
    let course = await Course.findByIdAndUpdate(id, {
        $set: {
            title: body.title,
            description: body.description
        }
    }, {new: true});

    return course;
}
async function disableCourse(id){
    let course = await Course.findByIdAndUpdate(id, {
        $set: {
            state: false
        }
    }, {new: true});

    return course;
}


module.exports = route;