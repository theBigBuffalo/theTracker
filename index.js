//this is like the inport statement so that I can use mysql in this project
const sqlite3 = require('sqlite3').verbose();


// creates a database object and opens the database connection automatically
let db = new sqlite3.Database('chinook.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the chinook SQlite database.');
});


//close the database connection
/*db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });*/

  //creating my table
  /*const createTableQuery = `
  CREATE TABLE [IF NOT EXISTS] [chinook.db].locationData (
    longitude DOUBLE DEFAULT NULL,
    latitude DOUBLE DEFAULT NULL,
    accuracy DOUBLE DEFAULT NULL,
    batteryLevel DOUBLE DEFAULT NULL,
    isCharging BOOLEAN DEFAULT NULL,
    time TEXT DEFAULT NULL,
    table_constraints
);
  `*/

  

//****************************************************************************** */

/* 1 this gives me access to the express package. 
it is kind of like an import statement.*/
const express = require('express');
 
const Datastore = require('nedb');
const database = new Datastore('database.db');


/* 2 this creates a web application called app.  When express 
was installed, it got downloaded like a big function.  Now I can just 
assign variable to the big function.  The whole package is put into the 
variable called app.  This line creates an instance of the express
application.  The instance is called 'app' */
const app = express();

/* 3 the .listen function allows the web application to start listening
for requests.  It takes in a port number as a parameter, and also takes
in a call back function as the second parameter */
app.listen(3000, () => console.log('listening at 3000'));

/* 4 the .use() function allows files to be served to the web application.
In this case, I am using express to help serve the files.  Any file that 
is in the folder called public will be able to be served.  The index.html
file is located inside the public folder, therefore when I go to the 
web application/web page at "localhost:3000", the server is serving the 
index.html file to the browser. */
app.use(express.static('public'));

/* 5 the express.json function allows incoming data to be parsed
as JSON. Inside the parentheses after .json, is a javascript object that
allows up to 1mb of data to be parsed, therefore someone can not overload
my server.*/
app.use(express.json({limit: '5mb'}));


/* 7 below I am making my database by creating an instance of the Datastore
class above.  I passed a parameter which is the name of by database file into 
the database function.  This will allow the Datastore() function to save data
to that file. */

//const database = new Datastore(database.db);

//database.loadDatabase();


/* 5 the .post() function in express means that this particular route 
will be a POST.  The first parameter that is takes is the url that the
information/data will be sent to.  The callback function has two
arguments (request and response).  The request variable contains
everything that contained inside the POST request from the client.
The response is a variable that I can use to send things back to the client*/


database.loadDatabase();
/*database.insert({
    name: 'john'
});*/
   



app.post('/api', (request, response) => {
    
    /*const clientLat = request.body.lat;
    const clientLon = request.body.lon;
    const clientAcc = request.body.acc;*/
    //console.log({clientLat, clientLon, clientAcc});
    const ipAdress = (request.body.ip).toString();
    //const ipAdress = '98.113.186.170';
    console.log('ip adress', request.body.ip);
    console.log(request.body);
    const data = request.body;
    database.insert(request.body);
    
//***********connecting to and modifying the SQLite database*************************

/*const createTableQuery = `
  CREATE TABLE IF NOT EXISTS locationData (
    ipAdress TEXT DEFAULT NULL,
    longitude TEXT DEFAULT NULL,
    longitude REAL DEFAULT NULL,
    latitude REAL DEFAULT NULL,
    accuracy REAL DEFAULT NULL,
    batteryLevel REAL DEFAULT NULL,
    isCharging INTEGER DEFAULT NULL,
    time TEXT DEFAULT NULL
  );
`;

// run query to create table
db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table created successfully');
    }
  
    // Close the database connection
    db.close((closeErr) => {
        if (closeErr) {
          console.error('Error closing database:', closeErr.message);
        } else {
          console.log('Database closed');
        }
      });
  });*/
  
//removing old data
  const deleteQuer = `
  DELETE FROM locationData
  WHERE ipAdress = ?;
`;

// Execute the query to remove rows
db.run(deleteQuer, [ipAdress], (err) => {
  if (err) {
    console.error('Error removing rows:', err.message);
  } else {
    console.log('Rows removed successfully');
  }
});




  

//inserting new data
  const insertQuery = `
  INSERT INTO locationData ( ipAdress, longitude, latitude, accuracy, batteryLevel, isCharging, time)
  VALUES (?, ?, ?, ?, ?, ?, ?);
`;

const dataToInsert = [request.body.ip, request.body.lon, request.body.lat, request.body.acc, request.body.batLvl, request.body.isCharging, request.body.time];


// run query to add information to table
db.run(insertQuery, dataToInsert, (err) => {
    if (err) {
      console.error('Error inserting data:', err.message);
    } else {
      console.log('Data inserted successfully');
    }
    
    // Close the database connection
    //db.close();
  });

 
 
  



//********************************************************

    //the below code is the response sending data back to the client 
    // so that the client knows that the information has been successfully
    // received by the server.
    response.json({
        status: 'success',
        latitude: request.body.lat,
        longitude: request.body.lon,
        accuracy: request.body.acc,
        batteryLevel: request.body.batLvl,
        isCharging: request.body.isCharging,
        ip: request.body.ip
    })
});












/*below is the second route that I has to get only the battery information, 
but now I just have them both in the other route*/

app.post('/apiBattery', (request, response) => {
    
    /*const clientBatLvl = request.body.batLvl;
    const clientIsCharging = request.body.isCharging;*/
    console.log(request.body);
    database.insert(request.body);
    //the below code is the response sending data back to the client 
    // so that the client knows that the information has been successfully
    // received by the server.
    response.json({
        status: 'battery success',
        batteryLevel: request.body.batLvl,
        isCharging: request.body.isCharging,
       
    })
});



app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        //response.json(data);
    });


    const query = 'SELECT * FROM locationData';
    
    db.all(query, (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        response.json(rows);
      }
    });
    
    //response.json(query);
    
});


/*app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        
        for(item of data)
        {
            if (item.id == request.body.lat)
            {
                const query = {ip: item.id};
                const updata = {$set: { batLvl: item } };
            }
        }
        
        
        response.json(data);
    });
    
});*/





/******************************************************************
**********************CLOSE MySQL Connection************************
****************************************************************** */






//function that console.logs the sqlite table
function showMeTheTable()
{
    
    const selectQuery = `
        SELECT * FROM locationData;
        `;
    
    
    db.all(selectQuery, [], (err, rows) => {
        if (err) {
          console.error('Error fetching data:', err.message);
        } else {
          console.log('Data fetched successfully');
      
          // Print the fetched data
          rows.forEach((row) => {
            console.log(row);
          });
        }
      
        // Close the database connection
        /*db.close((closeErr) => {
          if (closeErr) {
            console.error('Error closing database:', closeErr.message);
          } else {
            console.log('Database closed');
          }
        });*/
      });
}