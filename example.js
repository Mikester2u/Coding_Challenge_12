document.addEventListener('DOMContentLoaded', function () {
    const svgWidth = 600, svgHeight = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#chart").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", 'translate(${margin.left},${margin.top})');

d3.csv("mock_stock_data.csv").then(data => {
    data.forEach(d => {
        d.Date = new Date(d.Date);
        d.Value = +d.Value;
    });

    const stockNames = Array.from(new Set(data.map(d => d.StockName)));

    const stockSelect = d3.select('#stock-select');
    stockNames.forEach(stock => {
        stockSelect.append("option").text(stock).attr("value", stock);
    });

    d3.select("#filter-button").on("click", () => {
        const selectedStock = stockSelect.node().value;
        const startDate = new Date(d3.select("#start-date").node().value);
        const endDate = new Date(d3.select("#end-date").node().value);

        const filteredData = data.filter(d => {
            return d.StockName === selectedStock &&
                d.Date >= startDate &&
                d.Date <= endDate;
        });    

    updateChart(filteredDate);
});

function updateChart(data) {
    svg.selectAll("*").remove();

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Value)])
        .nice()
        .range([height, 0]);
    
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    
        svg.append("g")
            .call(yAxis);
    
            const line = d3.line()
            .x(d => x(d.Date))
            .y(d => y(d.Value));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "greenyellow")
            .attr("stroke-width", 1.5)
            .attr("d", line);
        
            svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.Date))
            .attr("cy", d => y(d.Value))
            .on("mouseover", (event, d) => {
                const [x, y] = d3.pointer(event);
                d3.select("#tooltip")
                    .style("left", x + "px")
                    .style("top", y + "px")
                    .style("opacity", 1)
                    .html(`Stock: ${d.StockName}<br>Date: ${d.Date.toLocaleDateString()}<br>Value: ${d.Value}`);
            })
            .on("mouseout", () => {
                d3.select("#tooltip")
                    .style("opacity", 0);
            });
    }


    updateChart(data.filter(d => d.StockName === stockNames[0]));
});


d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);
});