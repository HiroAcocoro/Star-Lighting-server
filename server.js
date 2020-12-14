const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
let port = process.env.PORT || 3001;

const db = mysql.createPool({
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b10cd80a8fa906',
    password: '0645214f',
    database: 'heroku_b9bd41e74ed7809',
});



app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))


app.get("/api/checkstudent/:studentNumber", (req, res) => {

    const studentNumber = req.params.studentNumber;
    student = [];

    const sqlSelect = "SELECT COUNT(studentNumber) AS countCheck FROM student_data WHERE studentNumber = ?";
    db.query(sqlSelect, studentNumber, (err, result) => {

        let check = JSON.parse(JSON.stringify(result));
        let value = check[0].countCheck;

        if (value > 0) {
            const sqlSelect = "SELECT * FROM student_data WHERE studentNumber = ?";
            db.query(sqlSelect, studentNumber, (err, newResult) => {
                student = newResult;
                res.send(student);
            });
        } else {
            student = "new";
            res.send(student);
        }
    });
});

app.post("/api/insert", (req, res) => {

    const studentFirstName = req.body.studentFirstName;
    const studentLastName = req.body.studentLastName;
    const studentNumber = req.body.studentNumber;
    const result = 0;

    const sqlInsert = "INSERT INTO student_data (studentFirstName, studentLastName, studentNumber, result) VALUES (?,?,?,?)";
    db.query(sqlInsert, [studentFirstName, studentLastName, studentNumber, result], (err, result) => {
        res.send(result);
    });
});


app.get("/api/spin/:studentNumber", (req, res) => {

    const studentNumber = req.params.studentNumber;
    // DONT FORGET TO UP ODDS OR EVERYONE WILL WIN!!!
    const time = new Date();
    const hour = time.getHours();    
    const odds = getOdds(hour);

    


    if (studentNumber === '05-1819-00001') {
        // HMMMMMMmmmmMMmmmMmmmmMmmm
        const sqlStudentDataUpdate = "UPDATE student_data SET result = ? WHERE studentNumber = ?";
        db.query(sqlStudentDataUpdate, [2, studentNumber], (err, result) => {
            if (err) {
                console.log(err);
            } else {}
        })

        const sqlPrizesUpdate = "UPDATE prizes SET prizeStatus = ? WHERE id = ?";
        db.query(sqlPrizesUpdate, [1, 2], (err, result) => {
            if (err) {
                console.log(err);
            } else {}
        })
        deg = getDeg(500);
        res.send(deg.toString());
    } else {
        // logic here
        const sqlSelect = "SELECT * FROM student_data WHERE studentNumber = ?";
        db.query(sqlSelect, [studentNumber], (err, result) => {
            if (result[0].result === '0') {
                const initialResult = winLose(odds);


                if (initialResult === 'lose') {
                    //lose function here
                    const sqlStudentDataUpdate = "UPDATE student_data SET result = ? WHERE studentNumber = ?";
                    db.query(sqlStudentDataUpdate, [initialResult, studentNumber], (err, result) => {
                        deg = getDeg(initialResult);
                        res.send(deg.toString());
                    });

                } else if (initialResult === 'win') {
                    winPrize(function(err, data) {
                        if (err) {
                            console.log("ERROR : ", err);
                        } else {
                            if (data === "lose") {
                                const sqlStudentDataUpdate = "UPDATE student_data SET result = ? WHERE studentNumber = ?";
                                db.query(sqlStudentDataUpdate, [data, studentNumber], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        deg = getDeg(data);
                                        res.send(deg.toString());
                                    }
                                });
                            } else {
                                const sqlStudentDataUpdate = "UPDATE student_data SET result = ? WHERE studentNumber = ?";
                                db.query(sqlStudentDataUpdate, [data.id, studentNumber], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {}
                                })

                                const sqlPrizesUpdate = "UPDATE prizes SET prizeStatus = ? WHERE id = ?";
                                db.query(sqlPrizesUpdate, [1, data.id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {}
                                })
                                deg = getDeg(data.prizeAmount);
                                res.send(deg.toString());
                            }
                        }
                    });
                }
            } else {
                res.send("can't spin again");
            }
        });
    }

})
app.post("/api/insert", (req, res) => {

    const studentFirstName = req.body.studentFirstName;
    const studentLastName = req.body.studentLastName;
    const studentNumber = req.body.studentNumber;
    const result = 0;

    const sqlInsert = "INSERT INTO student_data (studentFirstName, studentLastName, studentNumber, result) VALUES (?,?,?,?)";
    db.query(sqlInsert, [studentFirstName, studentLastName, studentNumber, result], (err, result) => {
        res.send(result);
    });
});

app.put("/api/b10cd80a8fa906/clear", (req, res) => {

    const sqlUpdate = "UPDATE prizes SET prizeStatus = ? WHERE prizeStatus = ?"
    db.query(sqlUpdate, [0, 1], (err, result) => {
        if (err) console.log(err);
    });

});


app.listen(port, () => {
    console.log("running on port 3001")
});

function winLose(odds) {
    result = Math.floor(Math.random() * Math.floor(odds - 1) + 1);
    if (result <= 33) {
        return ("win");
    } else {
        return ("lose");
    }
}

function getPrizeList(callback) {
    const sqlSelect = "SELECT * FROM prizes";

    db.query(sqlSelect, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}


function winPrize(callback) {
    const prizes = 33;

    var initialPrize = (Math.floor(Math.random() * Math.floor(prizes - 1) + 1) - 1);
    getPrizeList(function(err, data) {
        if (err) {
            console.log("ERROR : ", err);
        } else {
            var prizeCheck = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].prizeStatus === 1) {
                    prizeCheck++;
                }
            }
            if (prizeCheck === 33) {
                //all prizes won callback here
                callback(null, "lose");
            } else {
                if (data[initialPrize].prizeStatus === 0) {
                    //first win check triggered!
                    callback(null, data[initialPrize]);
                } else {
                    for (let i = 0; i < data.length; i++) {
                        if (data[initialPrize].prizeStatus === 1) {
                            initialPrize++;
                            if (initialPrize >= 33) {
                                initialPrize = 0;
                            }
                        } else {
                            break;
                        }
                    }
                    callback(null, data[initialPrize]);
                }
            }
        }
    });
}

function getDeg(result) {
    if (result === 'lose') {
        losePoint = Math.floor(Math.random() * (4 - 1 + 1) + 1);
        if (losePoint === 1) {
            deg = Math.floor(Math.random() * (66 - 22 + 1) + 22);
        } else if (losePoint === 2) {
            deg = Math.floor(Math.random() * (156 - 113 + 1) + 113);
        } else if (losePoint === 3) {
            deg = Math.floor(Math.random() * (244 - 202 + 1) + 202);
        } else if (losePoint === 4) {
            deg = Math.floor(Math.random() * (334 - 291 + 1) + 291);
        }
        return deg;
    } else if (result === 1000) {
        deg = Math.floor(Math.random() * (20 - (-24) + 1) + (-24));
        return deg;
    } else if (result === 500) {
        deg = Math.floor(Math.random() * (200 - 158 + 1) + 158);
        return deg;
    } else if (result === 200) {
        deg = Math.floor(Math.random() * (289 - 246 + 1) + 246);
        return deg;
    } else if (result === 100) {
        deg = Math.floor(Math.random() * (111 - 68 + 1) + 68);
        return deg;
    }
}

function getOdds(hour) {
    if (hour === 16) {
        return 250;
    } else if (hour === 17) {
        return 200;
    } else if (hour === 18) {
        return 200;
    } else if (hour === 19) {
        return 130;
    } else if (hour === 20) {
        return 70;
    } else {
        return 250;
    }
}