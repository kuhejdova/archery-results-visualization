// const e = require("express");

//Variable containing reference to data
var data1;

var data2;

//D3.js canvases
var resultsArea;
var hitsArea;
var endsArea;

var Tooltip;
var tooltip;

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

      maximumScore = 600;
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
  });
  
  
  

/*----------------------
INITIALIZE VISUALIZATION
----------------------*/
function init(callback) {
  
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


  tooltip = d3.select("#ends_div")
                                    .append("div")
                                    .style("opacity", 0)
                                    .attr("class", "tooltip")
                                    .style("background-color", "white")
                                    .style("color", "black")
                                    .style("border", "solid")
                                    .style("border-width", "2px")
                                    .style("border-radius", "5px")
                                    .style("padding", "5px")


Tooltip = d3.select("#results_div")
                                    .append("div")
                                    .style("opacity", 0)
                                    .attr("class", "tooltip")
                                    .style("background-color", "white")
                                    .style("color", "black")
                                    .style("border", "solid")
                                    .style("border-width", "2px")
                                    .style("border-radius", "5px")
                                    .style("padding", "5px")
  callback();
}

/*----------------------
BEGINNING OF VISUALIZATION
----------------------*/
function visualization() {


  resultsArea.remove()
  hitsArea.remove()
  endsArea.remove()


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

  var box = document.getElementById("switch");
  var button1 = document.getElementById("b1");
  var button2 = document.getElementById("b2");

  if (box.checked) {
    document.getElementById('switch').checked = true;
    if (localStorage.getItem('checked_year') === 'true'){
      button2.classList.remove("active");
      button1.classList.add("active"); 
      showingSeason = [winterSeason1Beg, summerSeason1Beg];
      actualSeason = "Indoor 2018/2019";
    } else {
      button1.classList.remove("active");
      button2.classList.add("active");
      showingSeason = [winterSeason2Beg, summerSeason2Beg];
      actualSeason = "Indoor 2019/2020";
    }
    
      //Draw text on the top
    drawTextInfo(data1);

    // Draw scatter plot with results
    drawResultsChart(data1);

    // Draw pieChart with most frequent hits
    drawBarChart(data1);

    drawHeatMap(data1);
  } else {

    if (localStorage.getItem('checked_year') === 'true'){
      button2.classList.remove("active");
      button1.classList.add("active");
      showingSeason = [summerSeason1Beg, winterSeason2Beg];
      actualSeason = "Outdoor 2018/2019";
    } else {
      button1.classList.remove("active");
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
  
    drawBarChart(data2);

    drawHeatMap(data2);
  }

}


/*----------------------
  TEXT INFORMATION
----------------------*/
function drawTextInfo(data){

  if (data[0].season == "Indoor"){
    document.getElementById("question_results").title="Archery indoor competition consists of 60 arrows \nshooted on 18m distance. There are 20 ends of 3 arrows. \nThe woman's world record is 595 points. \n\nYou can select one competition for the detail look when \nyou click on the circle. Click again for full statistics."
    document.getElementById("question_hits").title="There are three targets in the column, each \nfor one arrow per end. The middle is yellow \nand it's value is 10. The smallest value is 6, \neverything outside these color rings is M \n(for missed) and it has zero value."
    document.getElementById("question_ends").title="The end in indoor archery is the sum of three arrows, \neach one must be in the separate target. After the end \narchers go to target to write their score and shoot again. \nThere are 20 ends in total.\n\nDarker color means higher score."
  } else {
    document.getElementById("question_results").title="Archery outdoor competition consists of 72 arrows \nshooted on 70m distance. There are 12 ends of 6 arrows. \nThe woman's world record is 692 points \n\nYou can select one competition for the detail look when \nyou click on the circle. Click again for full statistics."
    document.getElementById("question_hits").title="There is one target per all six arrows. The middle is yellow \nand it's value is 10. In the middle of this ring there \nis one smaller X ring, which is also for 10 points, \nbut if there is a tie, the archer with more X is the winner. \nThe smallest value is 1, everything outside these rings is M \n(for missed) and it has zero value."
    document.getElementById("question_ends").title="The end in outdoor archery is the sum of six arrows \nAfter the end archers go to the target to write their \nscore and shoot again. There are 12 ends in total.\n\nDarker color means higher score."
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

  

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
        d3.select(this).style("cursor", "pointer");
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
        d3.select(this).style("cursor", "default");
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

var topValue;
var colorEnds;
  if (data.season == "Indoor"){
    topValue = 30;
    colorEnds = ['#ffffff', '#0000ff', '#000000']
    // colorEnds = ['#000000', '#0000ff', '#ffffff']
  } else {
    topValue = 60;
    colorEnds = ['#ffffff', '#ff0000', '#000000']
    // colorEnds = ['#000000', '#ff0000', '#ffffff']
  }
var myColor = d3.scaleLinear()
    .range(colorEnds)
    .domain([0, topValue/2, topValue])

// X axis
if (type_data == "hits"){
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(keysArray)
      .padding(0.2);
    area.append("g")
      .attr("transform", "translate(40," + (height + 10) + ")")
      .call(d3.axisBottom(x))
}else{

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
        .attr("fill", function(d) { return myColor(dataset[d]); })
        .attr("stroke", function(d) { return myColor(dataset[d]); }) 
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

    const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
    var dataset = countOccurrences(hitsArray);
    delete dataset["0"]
  

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

  var colorPalette;
  if (data[0].season == "Indoor"){
    colorPalette = ['#ffffff', '#0000ff', '#000000']
    // colorPalette = ['#000000', '#0000ff', '#ffffff']
  } else {
    colorPalette = ['#ffffff', '#ff0000', '#000000']
    // colorPalette = ['#000000', '#ff0000', '#ffffff']
  }

  

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
