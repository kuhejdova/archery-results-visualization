// const e = require("express");

//Variable containing reference to data
var data1;

var data2;

//D3.js canvases
var resultsArea;
var hitsArea;
var endsArea;

// maximum competition score
var maximumScore = 720;

var selectYear = 2020;

var indoorPalette = ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"]
var outdoorPalette = ["#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"]
var targetOutdoorPalette = {"X":"#ffff00", "10":"#ffff00", "9":"#ffff00", "8":"#ff0000", "7":"#ff0000", "6":"#0004ff", 
                            "5":"#0004ff", "4":"#000000", "3":"#000000", "2":"#ffffff", "1":"#ffffff", "M":"#ffffff"}
var targetIndoorPalette = {"10":"#ffff00", "9":"#ffff00", "8":"#ff0000", "7":"#ff0000", "6":"#0004ff", "M":"#ffffff"}

var checked_year;

var winterSeason1Beg = d3.timeParse("%d.%m.%Y")("1.11.2018");
var summerSeason1Beg = d3.timeParse("%d.%m.%Y")("31.3.2019");
var winterSeason2Beg = d3.timeParse("%d.%m.%Y")("1.11.2019");
var summerSeason2Beg = d3.timeParse("%d.%m.%Y")("31.3.2020");
var winterSeason3Beg = d3.timeParse("%d.%m.%Y")("1.11.2020");

var showingSeason = [winterSeason1Beg, summerSeason1Beg];
var actualSeason;


/*Loading data from CSV file and editing the properties to province codes. 
Unary operator plus is used to save the data as numbers (originally imported as string)*/
d3.csv("./public/EK_indoor_results.csv")
    .row(function(d) { return {
      
      date : d3.timeParse("%d.%m.%Y")(d.Date),
      season : d.Season,
      place : d.Place,
      name : d.Name,
      distance : d.Distance,
      score : +d.Result,
      firstHalf : d.firstHalf,
      secondHalf : d.secondHalf,
      allHits : [d["1"], d["2"], d["4"], d["6"], d["7"], d["8"], d["9"], d["10"],
                 d["11"], d["12"], d["13"], d["14"], d["15"], d["16"], d["17"], d["18"], d["19"], d["20"], 
                 d["21"], d["22"], d["23"], d["24"], d["25"], d["26"], d["27"], d["28"], d["29"], d["30"],
                 d["31"], d["32"], d["33"], d["34"], d["35"], d["36"], d["37"], d["38"], d["39"], d["40"],
                 d["41"], d["42"], d["43"], d["44"], d["45"], d["46"], d["47"], d["48"], d["49"], d["50"],
                 d["51"], d["52"], d["53"], d["54"], d["55"], d["56"], d["57"], d["58"], d["59"], d["60"]],
      allSets : [d["sum1"], d["sum2"], d["sum3"], d["sum4"], d["sum5"], d["sum6"], d["sum7"], d["sum8"], d["sum9"], d["sum10"],
                 d["sum11"], d["sum12"], d["sum13"], d["sum14"], d["sum15"], d["sum16"], d["sum17"], d["sum18"], d["sum19"], d["sum20"]],
      
    }; 
  }).get(function(error, rows) { 
      //Saving reference to data
      data1 = rows;

      ///Load map and initialise the views
      // init(function(){
      //   //Data visualization
      //   visualization();
      // });
      maximumScore = 600;
      console.log(rows);
      return('Success');
  });

d3.csv("./public/EK_outdoor_results.csv")
  .row(function(d) { return {
    
    date : d3.timeParse("%d.%m.%Y")(d.Date),
    season : d.Season,
    place : d.Place,
    name : d.Name,
    distance : d.Distance,
    score : +d.Result,
    firstHalf : d.firstHalf,
    secondHalf : d.secondHalf,
    allHits : [d["1"], d["2"], d["4"], d["6"], d["7"], d["8"], d["9"], d["10"],
                d["11"], d["12"], d["13"], d["14"], d["15"], d["16"], d["17"], d["18"], d["19"], d["20"], 
                d["21"], d["22"], d["23"], d["24"], d["25"], d["26"], d["27"], d["28"], d["29"], d["30"],
                d["31"], d["32"], d["33"], d["34"], d["35"], d["36"], d["37"], d["38"], d["39"], d["40"],
                d["41"], d["42"], d["43"], d["44"], d["45"], d["46"], d["47"], d["48"], d["49"], d["50"],
                d["51"], d["52"], d["53"], d["54"], d["55"], d["56"], d["57"], d["58"], d["59"], d["60"],
                d["61"], d["62"], d["63"], d["64"], d["65"], d["66"], d["67"], d["68"], d["69"], d["70"],
                d["71"], d["72"]],
    allSets : [d["sum1"], d["sum2"], d["sum3"], d["sum4"], d["sum5"], d["sum6"], d["sum7"], d["sum8"], d["sum9"], d["sum10"],
                d["sum11"], d["sum12"]],
    
  }; 
}).get(function(error, rows) { 
    //Saving reference to data
    data2 = rows;

    ///Load map and initialise the views
    init(function(){
      //Data visualization
      visualization();
    });
    console.log(rows);
    // return('Success');
  });
  
  
  

/*----------------------
INITIALIZE VISUALIZATION
----------------------*/
function init(callback) {

  

  let width = screen.width;
  let height = screen.height;

  //Retrieve a SVG file via d3.request, 
  //the xhr.responseXML property is a document instance
  function responseCallback (xhr) {
    d3.select("#body").append(function () {
            return xhr.responseXML.querySelector('svg');
        }).attr("id", "info_div")
        .attr("width", d3.select("#body").node().clientWidth)
        .attr("height", d3.select("#body").node().clientHeight)
        .attr("x", 0)
        .attr("y", 0);
        
    };
  
  //D3 canvases for svg elements

  resultsArea = d3.select("#results_div").append("svg")
                                    .attr("color", "#ffffff")
                                    .attr("width",d3.select("#results_div").node().clientWidth)
                                    .attr("height",d3.select("#results_div").node().clientHeight);

  hitsArea = d3.select("#pie_div").append("svg")
                                    .attr("width",d3.select("#pie_div").node().clientWidth)
                                    .attr("height",d3.select("#pie_div").node().clientHeight);

  endsArea = d3.select("#ends_div").append("svg")
                                    .attr("width",d3.select("#ends_div").node().clientWidth)
                                    .attr("height",d3.select("#ends_div").node().clientHeight);

  callback();
}


/*----------------------
BEGINNING OF VISUALIZATION
----------------------*/
function visualization() {

  var box = document.getElementById("switch");
  var button1 = document.getElementById("b1");
  var button2 = document.getElementById("b2");

  if (box.checked) {
    console.log("Indoor")
    if (localStorage.getItem('checked_year') === 'true'){
      button1.classList.add("active"); 
      showingSeason = [winterSeason1Beg, summerSeason1Beg];
      actualSeason = "Indoor 2018/2019";
    } else {
      button2.classList.add("active");
      showingSeason = [winterSeason2Beg, summerSeason2Beg];
      actualSeason = "Indoor 2019/2020";
    }
    
      //Draw text on the top
    drawTextInfo(data1);

    // Draw scatter plot with results
    drawResultsChart(data1);

    // Draw pieChart with most frequent hits
    // drawPieChart(data1);
    drawBarChart(data1);

    drawHeatMap(data1);
  } else {
    console.log("Outdoor")
    if (localStorage.getItem('checked_year') === 'true'){
      button1.classList.add("active");
      showingSeason = [summerSeason1Beg, winterSeason2Beg];
      actualSeason = "Outdoor 2018/2019";
    } else {
      button2.classList.add("active");
      showingSeason = [summerSeason2Beg, winterSeason3Beg];
      actualSeason = "Outdoor 2019/2020";
    }
    
    maximumScore = 720;
      //Draw text on the top
    drawTextInfo(data2);

    // Draw scatter plot with results
    drawResultsChart(data2);

    // Draw pieChart with most frequent hits
    // drawPieChart(data2);
    drawBarChart(data2);

    drawHeatMap(data2);
  }

}


/*----------------------
  TEXT INFORMATION
----------------------*/
function drawTextInfo(data){
  
  //Draw headline
  // infoArea.append("text")
  //        .attrs({dx: 10, dy: "1em", class: "headline"})
  //        .text("Competition results");

  // //Draw source
  // infoArea.append("text")
  //        .attrs({dx: 10, dy: "4em", class: "subline"})
  //        .text("Data source: Rcherz Eva Kuhejdová")
  //        .on("click", function() { window.open("https://www.rcherz.com/cs/users/viewProfile/52cf7168/eva_kuhejdova"); });;
  

  if (data[0].season == "Indoor"){
    document.getElementById("question_results").title="Archery Indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nWomen world record is 595 points."
    document.getElementById("question_hits").title="Archery Indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nWomen world record is 595 points."
    document.getElementById("question_ends").title="Archery Indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nWomen world record is 595 points."
  } else {
    document.getElementById("question_results").title="Archery Outdoor competition consists of 72 arrows \nshooted on 70m distance. There are 12 ends of 6 arrows. \nWomen world record is 692 points"
    document.getElementById("question_hits").title="Archery Indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nWomen world record is 595 points."
    document.getElementById("question_ends").title="Archery Indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nWomen world record is 595 points."
  }
  

  document.getElementById("details").innerHTML = "Season: " + actualSeason + "<br>Distance: " + data[0].distance + "<br>Maximum score: " + maximumScore + " points";
  

}


// /*----------------------
//   RESULTS CHART
// ----------------------*/
function drawResultsChart(data){
  var colorPalette;
  if (data[0].season == "Indoor"){
    colorPalette = indoorPalette;
  } else {
    colorPalette = outdoorPalette;
  }

  var seasonData = [];
  for (i = 0; i < data.length; i++) {
    if (data[i].date > showingSeason[0] && data[i].date < showingSeason[1]){
      seasonData.push(data[i]);
    }  
  } 


  if(data[0].season == "Indoor") maximumScore = 600;

  let thisCanvasWidth = resultsArea.node().clientWidth;
  let thisCanvasHeight = resultsArea.node().clientHeight;


  var margin = {top: 10, right: 30, bottom: 20, left: 60},
    width = thisCanvasWidth - margin.left - margin.right,
    height = thisCanvasHeight - margin.top - margin.bottom;



  var formatTime = d3.timeFormat("%d. %m. %Y");
  

// append the svg object to the body of the page
resultsArea
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  

  var x = d3.scaleTime()
      // .domain(d3.extent(data, function(d) { return d.date; }))
      .domain([showingSeason[0], showingSeason[1]])
      .range([ 0, width ]);
    resultsArea.append("g")
      .attr("transform", "translate(40," + (height + 10)+ ")")
      .call(d3.axisBottom(x))
      .attr("stroke", "white")
      // .attr("stroke-width", 1.5);
    // Add Y axis
    var y = d3.scaleLinear()
      .domain( [300, maximumScore])
      .range([ height, 0 ]);
    resultsArea.append("g")
      .attr("transform", "translate(40, 10)")
      .call(d3.axisLeft(y))
      .attr("stroke", "white")
      // .attr("stroke-width", 1.5);
    // Add the line
  resultsArea.append("path")
      .datum(seasonData)
      .attr("fill", "none")
      .attr("stroke", colorPalette[2])
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.score) })
        )
      .attr("transform", "translate(40, 10)")


  var Tooltip = d3.select("#results_div")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("color", "black")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html("Date: " + formatTime(d.date) + "<br>" +"Score: " + d.score)
          .style("left", (d3.mouse(this)[0]+70) + "px")
          .style("top", (d3.mouse(this)[1]+170) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
      }



    // Add the points
  resultsArea
      .append("g")
      .selectAll("dot")
      .data(seasonData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.date) } )
        .attr("cy", function(d) { return y(d.score) } )
        .attr("r", 5)
        .attr("fill", colorPalette[2])
        .attr("stroke", colorPalette[2]) 
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", function(d){
          if (!d3.select(this).classed("selected") ){
            d3.selectAll('circle').classed("selected", false)
            d3.select(this).classed("selected", true)
            d3.selectAll('circle') //<-- or slap a class name on your circles and use that
              .style('fill', colorPalette[2])
              .style('stroke', colorPalette[2]);
             
            d3.select(this).style("fill", colorPalette[4]);
            d3.select(this).style("stroke", colorPalette[4]);
            hitsArea.remove();
            hitsArea = d3.select("#pie_div").append("svg")
                                              .attr("width",d3.select("#pie_div").node().clientWidth)
                                              .attr("height",d3.select("#pie_div").node().clientHeight);
            
            var searchedLine = []
            for (var k = 0; k < seasonData.length; k++){
              if (seasonData[k].date == d.date){
                  searchedLine = seasonData[k];
              }
            }
            console.log("searched line " + searchedLine);
            drawBarChartLine(searchedLine, "hits");

            endsArea.remove();
            endsArea = d3.select("#ends_div").append("svg")
                                    .attr("width",d3.select("#ends_div").node().clientWidth)
                                    .attr("height",d3.select("#ends_div").node().clientHeight);
            
            drawBarChartLine(searchedLine, "ends");

          }else{
            d3.select(this).classed("selected", false);
            d3.select(this).style("fill", colorPalette[2]);
            d3.select(this).style("stroke", colorPalette[2]);
            hitsArea.remove();
            hitsArea = d3.select("#pie_div").append("svg")
                                              .attr("width",d3.select("#pie_div").node().clientWidth)
                                              .attr("height",d3.select("#pie_div").node().clientHeight);
            
            drawBarChart(data);

            endsArea.remove();
            endsArea = d3.select("#ends_div").append("svg")
                                    .attr("width",d3.select("#ends_div").node().clientWidth)
                                    .attr("height",d3.select("#ends_div").node().clientHeight);
            
            drawHeatMap(data);
        }

        })
      .attr("transform", "translate(40, 10)")

}


// /*--------------------------
//   BAR CHART FROM ONE RECORD
// ----------------------------*/
function drawBarChartLine(data, type_data){
  var area;
  if(type_data == "hits"){
    area = hitsArea;
  } else {
    area = endsArea;
  }

  var colorPalette;
  if (data.season == "Indoor"){
    colorPalette = indoorPalette;
  } else {
    colorPalette = outdoorPalette;
  }

  // pieArea
  //   .append("text")
  //   .attrs({dx: 100, dy: "2em", class: "blockText"})     
  //   .text("Results");

  if(data.season == "Indoor") maximumScore = 600;

  let thisCanvasWidth = area.node().clientWidth;
  let thisCanvasHeight = area.node().clientHeight;


  var margin = {top: 10, right: 30, bottom: 20, left: 60},
    width = thisCanvasWidth - margin.left - margin.right,
    height = thisCanvasHeight - margin.top - margin.bottom;

  var maxVal = 60;
  var hitNums = 12;
  if (data.season == "Indoor"){
      maxVal = 30;
      hitNums = 7;
  }

  var hitsArray;
  var dataset;
  var keysArray;
    if (type_data == "hits"){
      hitsArray = data.allHits;
      const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
      dataset = countOccurrences(hitsArray);
      delete dataset["0"]
      
      if (data.season == "Indoor"){
        colorPalette = targetIndoorPalette;
        keysArray = ['10', '9', '8', '7', '6', 'M']
      } else {
        colorPalette = targetOutdoorPalette;
        keysArray = ['X','10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M']
      }
    } else {
      hitsArray = data.allSets;
      dataset = hitsArray;
      
    }
  
    
// var range_x = [];
// for (var i = 0; i < dataset.length; i++){
//   range_x.add(dataset.key[0] + 1)
// }
    


// X axis
if (type_data == "hits"){
    // console.log("this is dataset " + dataset);
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(keysArray)
      .padding(0.2);
    area.append("g")
      .attr("transform", "translate(40," + (height + 10) + ")")
      .call(d3.axisBottom(x))
}else{
  // console.log("this is dataset " + dataset);
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(Object.keys(dataset))
      .padding(0.2);
    area.append("g")
      .attr("transform", "translate(40," + (height + 10) + ")")
      .call(d3.axisBottom(x).tickFormat(function(d) { return parseInt(d, 10) + 1; }))
}



// Add Y axis
  if (type_data == "hits"){

        var y = d3.scaleLinear()
          .domain([0, d3.max(Object.values(dataset))])
          .range([ height, 0]);
        area.append("g")
          .call(d3.axisLeft(y))
          .attr("transform", "translate(40, 10)");
  } else {
        var y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([ height, 0]);
    area.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", "translate(40, 10)");
  }


// Bars
if (type_data == "hits"){
hitsArea.selectAll("mybars")
  .data(keysArray)
  .enter()
  .append("rect")
   .attr("x", function(d) { return x(d); })
    .attr("y", function(d) { return y(dataset[d]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(dataset[d]); })
    .attr("fill", function(d) { return colorPalette[d]; })
    .attr("stroke", function(d) { return colorPalette[d]; }) 
    .attr("transform", "translate(40, 10)")
  } else {
area.selectAll("mybars")
  .data(d3.keys(dataset))
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d); })
    .attr("y", function(d) { return y(dataset[d]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(dataset[d]); })
    .attr("fill", colorPalette[3])
    .attr("stroke", colorPalette[3]) 
    .attr("transform", "translate(40, 10)")
  }
}


// /*----------------------
//   BAR CHART
// ----------------------*/
function drawBarChart(data){
  var colorPalette;
  var keysArray;
  if (data[0].season == "Indoor"){
    keysArray = ['10', '9', '8', '7', '6', 'M']
    colorPalette = targetIndoorPalette;
  } else {
    keysArray = ['X','10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M']
    colorPalette = targetOutdoorPalette;
  }

  // pieArea
  //   .append("text")
  //   .attrs({dx: 100, dy: "2em", class: "blockText"})     
  //   .text("Results");

  if(data[0].season == "Indoor") maximumScore = 600;

  let thisCanvasWidth = hitsArea.node().clientWidth;
  let thisCanvasHeight = hitsArea.node().clientHeight;


  var margin = {top: 10, right: 30, bottom: 20, left: 60},
    width = thisCanvasWidth - margin.left - margin.right,
    height = thisCanvasHeight - margin.top - margin.bottom;

  var maxVal = 60;
  var hitNums = 12;
  if (data[0].season == "Indoor"){
      maxVal = 30;
      hitNums = 7;
  }

    var i;
    var hitsArray = [];
    for (i = 0; i < data.length; i++) {
      if (data[i].date > showingSeason[0] && data[i].date < showingSeason[1]){
        hitsArray = hitsArray.concat(data[i].allHits);
      }
      
    } 
    console.log("A" + hitsArray);


    const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
    var dataset = countOccurrences(hitsArray);
    delete dataset["0"]
    

    
    // var dataset = [0,0,0,0,0,0,0,0,0,0,0,0]
    // for(const [key, val] of Object.entries(datasetUnordered)){
    //   dataset[keysArray.indexOf(key)] = val;
    // }
    

    // for(var i = )
    
    //   for(const [key, val] of Object.entries(datasetUnordered)){
    //     dataset[[Symbol(key)]] = val
    // }
    // // datasetUnordered = Object.assign(dataset, datasetUnordered);
    // for(const [key, val] of Object.entries(dataset)){
    //   if (val === null) {
    //     delete dataset[[Symbol(key)]];
    //   }
  // }
  // dataset.sort(function(a, b) {
  //   return d3.ascending(keysArray.indexOf(a.key), keysArray.indexOf(b.key))
  // });
  //   console.log(dataset);
    

var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(keysArray)
  .padding(0.2);
hitsArea.append("g")
  .attr("transform", "translate(40," + (height + 10) + ")")
  .call(d3.axisBottom(x))

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, d3.max(Object.values(dataset))])
  .range([ height, 0]);
hitsArea.append("g")
  .call(d3.axisLeft(y))
  .attr("transform", "translate(40, 10)");

// Bars
hitsArea.selectAll("mybars")
  .data(keysArray)
  .enter()
  .append("rect")
   .attr("x", function(d) { return x(d); })
    .attr("y", function(d) { return y(dataset[d]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(dataset[d]); })
    .attr("fill", function(d) { return colorPalette[d]; })
    .attr("stroke", function(d) { return colorPalette[d]; }) 
    .attr("transform", "translate(40, 10)")
}




// /*----------------------
//   PIE CHART
// ----------------------*/
// function drawPieChart(data){

//   var colorPalette;
//   if (data[0].season == "Indoor"){
//     colorPalette = indoorPalette;
//   } else {
//     colorPalette = outdoorPalette;
//   }
//   pieArea
//     .append("text")
//     .attrs({dx: 10, dy: "2em", class: "blockText"})     
//     .text("Hits frequency");

//   var thiswidth = pieArea.node().clientWidth;
//   var thisheight = pieArea.node().clientHeight;

//   // var width = 450
//   //   height = 450
//   var margin = 20

//   // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
//   var radius = Math.min(thiswidth, thisheight) / 2 - margin

//   // append the svg object to the div called 'my_dataviz'
//   pieArea
//     .append("svg")
//       .attr("width", thiswidth)
//       .attr("height", thisheight)
//     .append("g")
//       .attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 2 + ")");

//   pieArea.append("g")
//     .attr("class", "labels");
//   pieArea.append("g")
//     .attr("class", "lines");

//   // create data - hits frequency
//   var i;
//   var hitsArray = [];
//   for (i = 0; i < data.length; i++) {
//     if (data[i].date > showingSeason[0] && data[i].date < showingSeason[1]){
//       hitsArray = hitsArray.concat(data[i].allHits);
//     }
    
//   } 
  
//   const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
//   var dataset = countOccurrences(hitsArray);
//   delete dataset["0"]
//   // console.log(dataset);

//   // set the color scale
//   var color = d3.scaleOrdinal()
//     .domain(dataset)
//     .range(colorPalette)

//   // Compute the position of each group on the pie:
//   var pie = d3.pie()
//     .sort(dataset.key)
//     .value(function(d) {return d.value; })
//   var data_ready = pie(d3.entries(dataset))


//   var arc = d3.arc()
// 	.outerRadius(radius * 0.8)
// 	.innerRadius(radius * 0.4);

//   var outerArc = d3.arc()
// 	.innerRadius(radius * 0.9)
// 	.outerRadius(radius * 0.9);

//   function labelData (){
//     var labels = color.domain();
//     return labels.map(function(label){
//       return { label: label, value: dataset.key }
//     });
//   }

//   // shape helper to build arcs:
//   var arcGenerator = d3.arc()
//     .innerRadius(0)
//     .outerRadius(radius)
//   // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
//   pieArea
//     .selectAll('mySlices')
//     .data(data_ready)
//     .enter()
//     .append('path')
//     .attr('d', arcGenerator)
//     .attr('fill', function(d){ return(color(d.data.key)) })
//     .attr("stroke", "black")
//     .style("stroke-width", "2px")
//     .style("opacity", 0.7)
//     .attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 2 + ")");


//     // Now add the annotation. Use the centroid method to get the best coordinates
//   pieArea
//   .selectAll('mySlices')
//   .data(data_ready)
//   .enter()
//   .append('text')
//   .text(function(d){ return d.data.key})
//   .attr("transform", function(d) { 
//     var coords = arcGenerator.centroid(d)
//     // console.log(coords)
//     return "translate(" + (coords[0] + thiswidth / 2) + ", " + (coords[1] + thisheight / 2) + ")";  })
//   .style("text-anchor", "middle")
//   .style("font-size", "15px")


//   /* ------- TEXT LABELS -------*/

// 	var text = pieArea.select(".labels").selectAll("text")
//   .data(pie(data), dataset.key);

//   text.enter()
//     .append("text")
//     .attr("dy", ".35em")
//     .text(function(d) {
//       return d.data.key;
//     });

//   function midAngle(d){
//     return d.startAngle + (d.endAngle - d.startAngle)/2;
//   }

//   text.transition().duration(1000)
// 		.attrTween("transform", function(d) {
// 			this._current = this._current || d;
// 			var interpolate = d3.interpolate(this._current, d);
// 			this._current = interpolate(0);
// 			return function(t) {
// 				var d2 = interpolate(t);
// 				var pos = outerArc.centroid(d2);
// 				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
// 				return "translate("+ pos +")";
// 			};
// 		})
// 		.styleTween("text-anchor", function(d){
// 			this._current = this._current || d;
// 			var interpolate = d3.interpolate(this._current, d);
// 			this._current = interpolate(0);
// 			return function(t) {
// 				var d2 = interpolate(t);
// 				return midAngle(d2) < Math.PI ? "start":"end";
// 			};
// 		});

//   text.exit()
//     .remove();

//   /* ------- SLICE TO TEXT POLYLINES -------*/

//   var polyline = pieArea.select(".lines").selectAll("polyline")
//     .data(pie(data), dataset.key);

//   polyline.enter()
//     .append("polyline");

//   polyline.transition().duration(1000)
// 		.attrTween("points", function(d){
// 			this._current = this._current || d;
// 			var interpolate = d3.interpolate(this._current, d);
// 			this._current = interpolate(0);
// 			return function(t) {
// 				var d2 = interpolate(t);
// 				var pos = outerArc.centroid(d2);
// 				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
// 				return [arc.centroid(d2), outerArc.centroid(d2), pos];
// 			};			
// 		});

//   polyline.exit()
//     .remove();
    
// }


/*----------------------
  HEAT MAP
----------------------*/
function drawHeatMap(data){
  var thisCanvasWidth = endsArea.node().clientWidth;
  var thisCanvasHeight = endsArea.node().clientHeight;


  var margin = {top: 10, right: 30, bottom: 20, left: 60},
    width = thisCanvasWidth - margin.left - margin.right,
    height = thisCanvasHeight - margin.top - margin.bottom;

  // create data - all dates

  var endsArray;
  var topValue;
  if (data[0].season == "Indoor"){
    endsArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", 
                 "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
    topValue = 30;
  } else {
    endsArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    topValue = 60;
  }

  var formatTime = d3.timeFormat("%d.%m.");
  var seasonData = [];
  var datesArray = [];
  for (i = 0; i < data.length; i++) {
    if (data[i].date > showingSeason[0] && data[i].date < showingSeason[1]){
      datesArray = datesArray.concat(formatTime(data[i].date));
      seasonData.push(data[i]);
    }  
  } 
  console.log("dates array", datesArray);
  console.log("season data", seasonData);

  var colorPalette;
  if (data[0].season == "Indoor"){
    colorPalette = ['#ffffff', '#0000ff', '#000000']
    // colorPalette = ['#000000', '#0000ff', '#ffffff']
  } else {
    colorPalette = ['#ffffff', '#ff0000', '#000000']
    // colorPalette = ['#000000', '#ff0000', '#ffffff']
  }

  var tooltip = d3.select("#ends_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("color", "black")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip.style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html("Sum of end: " + d.val)
      .style("left", (d3.mouse(this)[0]+700) + "px")
      .style("top", (d3.mouse(this)[1]+380) + "px")
  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0)
  }

  endsArea
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  var myData = [];

  for (var i = 0; i < seasonData.length; i++){

    for (var j = 0; j < seasonData[0].allSets.length; j++){
        myData.push({
            y: formatTime(seasonData[i].date),
            x: (j+1).toString(),
            val: seasonData[i].allSets[j]
        });
    }
  }



  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(endsArray)
    .padding(0.01);
  endsArea.append("g")
    .attr("transform", "translate(50," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(3,0)")
    .style("text-anchor", "end");

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(datesArray)
    .padding(0.01);
  endsArea.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", "translate(50,0)");

  // Build color scale
  var myColor = d3.scaleLinear()
    .range(colorPalette)
    .domain([0, topValue/2, topValue])


  // Read the data
  endsArea.selectAll()
        .data(myData)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x) })
        .attr("y", function(d) { return y(d.y) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .attr("stroke", function(d) { return myColor(d.val)})
        .style("fill", function(d) { return myColor(d.val)} )
        .attr("transform", "translate(51,0)")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

}



// /*----------------------
//   HEAT MAP
// ----------------------*/
// function drawHeatMap(){

//   //Once again, get dimenstions of canvas
//   let thisCanvasWidth = heatMapArea.node().clientWidth;
//   let thisCanvasHeight = heatMapArea.node().clientHeight;
  
//   //Caluculate the dimensions of all 654*6 bars
//   let thisRectWidth = thisCanvasWidth/data.length;
//   let thisRectHeigth = thisCanvasHeight/6;

//   for (var i = 0; i < data.length; i++) {
//     let indexY = 0;
//     for(var key in data[i]){
//       // console.log(key)
//       if(key != 'date') {
//         let region = key;
//         let index = i;
//         let currentValue = data[i][key];
//         let thisColor = d3.rgb(255 * (currentValue / topValue),0,0);
//         if(currentValue == 0) thisColor = d3.color("#3e4147")
//         heatMapArea.append('rect')
//          .attrs({ 
//             x: i * thisRectWidth, 
//             y: indexY * thisRectHeigth, 
//             width: thisRectWidth + 1, 
//             height: thisRectHeigth, 
//             fill: thisColor })
//          .on("click", function(){
//                   heatMapClick(thisColor, index, region, thisRectWidth, thisCanvasHeight);
//                 });
//         indexY++;
//       }
//     }

//     //Once again the labels, using foreach cycle with callback function
//     let index = thisRectHeigth;
//     data.columns.forEach(function(col){
//       if(col != "Date"){
//         // console.log(col)
//             heatMapArea.append("text")
//              .attrs({ dx: 0,
//                       dy: index,
//                       class: "label",
//                       fill: "white"})
//              .text(col);

//              index += thisRectHeigth;
//       }
//     }) 

//   }

//   //Data selected rectangle
//   selectedDate = heatMapArea.append('rect');

// }

// function updateBarChart(region){

//     //Get the dimensions of the canvas
//     let thisCanvasWidth = barChartArea.node().clientWidth;
//     let thisCanvasHeight = barChartArea.node().clientHeight;
    
//     //Get the width of one bar in the bar chart
//     let thisRectWidth = thisCanvasWidth/data.length;

//     //Get the region anotations
//     //If we don't have records for this region (it starts with ARG), we use whole Argentina records
//     let thisRegion = (region.substring(0, 3) === "ARG") ? "Argentina" : region;

//     //Remove whole canvas and create it once again
//     barChartArea.remove()
//     barChartArea = d3.select("#barchart_div").append("svg")
//                                     .attr("width",d3.select("#barchart_div").node().clientWidth)
//                                     .attr("height",d3.select("#barchart_div").node().clientHeight);

//     //Iterate through whole dataset                               
//     for (var i = 0; i < data.length; i++) {
//       //Calculate the height of previously and currently selected region
//       //During the startup, previous region is null, so values rise from zero
//       let lastHeight = (lastSelectedRegion == null) ? 0 : (data[i][lastSelectedRegion]/topValue) * thisCanvasHeight;
//       let thisHeight = (data[i][thisRegion]/topValue) * thisCanvasHeight;
//       barChartArea.append('rect')
//        .attrs({ 
//           x: i * thisRectWidth, 
//           y: thisCanvasHeight - lastHeight, 
//           width: thisRectWidth + 1, 
//           height: lastHeight, 
//           fill: 'red' })    
//       .transition() //Animation function
//       .duration(1000) //Duration in ms
//       .attrs({ y: thisCanvasHeight - thisHeight, //Adjust only necessary attributes
//               height: thisHeight});              //which is y position and height of the bar
//     }  
    
//     //Init the current year string variable
//     var currentYear = "";

//     //And consequently iterate through the dataset and check change in years
//     for (var i = 0; i < data.length; i++) {
//         if(data[i].date.substr(0, 4) != currentYear){

//             //Once year changes, append a text on top of bar charts
//             currentYear = data[i].date.substr(0, 4)
//             barChartArea.append("text")
//              .attrs({ dx: i*thisRectWidth,
//                       dy: thisCanvasHeight,
//                       class: "label"})
//              .text(currentYear);
//       }
//     }

//     //Don't forget to swap regions
//     lastSelectedRegion = thisRegion;
// }

// /*----------------------
//   INTERACTION
// ----------------------*/
// function mapClick(region){
    
//     //Debugging purposes
//     console.log(region.id)
//     selectedRegion = region.id;

//     // You can change a D3 object by deleting it and creating it once again
//     // selectedAreaText.remove();
//     // selectedAreaText = textArea.append("text")
//     //      .attrs({dx: 20, dy: "4.8em", class: "subline"})
//     //      .text("Selected Region: " + selectedRegion.replace("_", " "));

//     //Or you can just update it's characteristics
//     //And prepare the string so it looks lovely
//     if(selectedRegion.substr(0, 3) == 'ARG') selectedRegion = "Whole Argentina"
//     selectedAreaText.text("Selected Region: " + selectedRegion.replace("_", " "));

//     //Call update bar chart function
//     updateBarChart(region.id);

// }

// /*----------------------
//   ADVANCED INTERACTION
// ----------------------*/
// function heatMapClick(color, index, region, thisBarWidth, thisCanvasHeight){
  
//   //For all regions in our dataset, change color to newly computed
//   for(var key in data[index]) {
//       if (key != "date") {
//         let thisColor = d3.color("rgb(" + Math.round(data[index][key]/topValue * 255) + ", 0, 0)")
//         d3.select("body").select("#" + key).style("fill", thisColor);
//       }
//   }

//   //Redraw Date selection bar
//   selectedDate.attrs({ x: thisBarWidth*index - thisBarWidth, 
//                     y: 0, 
//                     width: thisBarWidth*3, 
//                     height: thisCanvasHeight, 
//                     fill: "white" })
//            .style("opacity", 0.25); 
// }

