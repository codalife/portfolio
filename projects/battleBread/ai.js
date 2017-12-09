(function() {
    class SmartPlayer {
        constructor() {
            this.size = 8;
            this.board = [];
            this.ships = {
                5: 5,
                4: 4,
                3: 3,
                2: 2
            };
            this.rows = {
                0: [[0, 7]],
                1: [[0, 7]],
                2: [[0, 7]],
                3: [[0, 7]],
                4: [[0, 7]],
                5: [[0, 7]],
                6: [[0, 7]],
                7: [[0, 7]],
            };
            this.columns = {
                0: [[0, 7]],
                1: [[0, 7]],
                2: [[0, 7]],
                3: [[0, 7]],
                4: [[0, 7]],
                5: [[0, 7]],
                6: [[0, 7]],
                7: [[0, 7]],
            };
            this.hitStack = [];
            this.refreshBoard();
        }

        refreshBoard() {
            this.board = [];

            for (let i = 0; i < this.size; i++) {
                let row = [];
                for (let j = 0; j < this.size; j++) {
                    row.push(0);
                }
                this.board.push(row);
            }
        }

        inStack(cell) {
            let contains = false;
            this.hitStack.forEach(c => {
                if (cell[0] === c[0] && cell[1] === c[1]) {
                    contains = true;
                }
            })
            return contains;
        }

        splitAreas(prey) {
            const areasR = this.rows[prey[0]];

            const areasToRemove = [];
            if (areasR) {
                areasR.forEach((area, index) => {

                    if (prey[1] === area[0]) {
                        area[0] += 1;
                    } else if (prey[1] === area[1]) {
                        area[1] -= 1;
                    } else if (prey[1] > area[0] && prey[1] < area[1]) {
                        areasR.splice(index, 1, [area[0], prey[1] - 1], [prey[1] + 1, area[1]]);
                    }
                    if (area[0] >= area[1]) {
                        areasToRemove.push(index);
                    }
                })

                while (areasToRemove.length) {
                    areasR.splice(areasToRemove.pop(), 1);
                }
            }


            const areasC = this.columns[prey[1]];
            if (areasC) {
                areasC.forEach((area, index) => {
                    if (prey[0] === area[0]) {
                        area[0] += 1;
                    } else if (prey[0] === area[1]) {
                        area[1] -= 1;
                    } else if (prey[0] > area[0] && prey[0] < area[1]) {
                        areasC.splice(index, 1, [area[0], prey[0] - 1], [prey[0] + 1, area[1]]);
                    }
                    if (area[0] >= area[1]) {
                        areasToRemove.push(index);
                    }
                })

                while (areasToRemove.length) {
                    areasC.splice(areasToRemove.pop(), 1);
                }
            }

        }

        hunt() {
            for (let ship in this.ships) {
                for (let row in this.rows) {
                    this.rows[row].forEach(area => {
                        if (area[1] - area[0] + 1 >= this.ships[ship]) {
                            _.range(area[0], area[1] + 1).forEach(cell => {
                                let len = Math.min(this.size + 1 - this.ships[ship], this.ships[ship]);
                                if (cell - area[0] >= len && area[1] - cell >= len) {
                                    this.board[parseInt(row)][cell] += len;
                                } else {
                                    this.board[parseInt(row)][cell] += Math.min(cell - area[0] + 1, area[1] - cell + 1);
                                }
                            })
                        }
                    })
                }
            }
            for (let ship in this.ships) {
                for (let col in this.columns) {
                    this.columns[col].forEach(area => {
                        if (area[1] - area[0] + 1 >= this.ships[ship]) {
                            _.range(area[0], area[1] + 1).forEach(cell => {
                                let len = Math.min(this.size + 1 - this.ships[ship], this.ships[ship]);
                                if (cell - area[0] >= len && area[1] - cell >= len) {
                                    this.board[cell][parseInt(col)] += len;
                                } else {
                                    this.board[cell][parseInt(col)] += Math.min(cell - area[0] + 1, area[1] - cell + 1);
                                }
                            })
                        }
                    })
                }
            }

            return this.board;
        }

        target() {

            this.hitStack.forEach(cell => {
                let row = this.rows[cell[0]];
                let areaRow;

                row.forEach(area => {
                    if (cell[1] >= area[0] && cell[1] <= area[1]) {
                        areaRow = area;
                    }
                })

                let col = this.columns[cell[1]];
                let areaCol;

                col.forEach(area => {
                    if (cell[0] >= area[0] && cell[0] <= area[1]) {
                        areaCol = area;
                    }
                })

                if (areaRow) {
                    for (let ship in this.ships) {
                        _.range(areaRow[0], Math.max(Math.min(cell[1] + 1, areaRow[1] - this.ships[ship] + 2), areaRow[0])).forEach(c => {
                            if (c <= cell[1] && c + this.ships[ship] >= cell[1]) {
                                for (let i = c; i < Math.min(c + this.ships[ship], this.size); i++) {
                                    if (!this.inStack([cell[0], i])) {
                                        this.board[cell[0]][i] += 1;
                                    }
                                }
                            }
                        })
                    }
                }

                if (areaCol) {
                    for (let ship in this.ships) {
                        _.range(areaCol[0], Math.max(Math.min(cell[0] + 1, areaCol[1] - this.ships[ship] + 2), areaCol[0])).forEach(c => {
                            if (c <= cell[0] && c + this.ships[ship] >= cell[0]) {
                                for (let i = c; i < Math.min(c + this.ships[ship], this.size); i++) {
                                    if (!this.inStack([i, cell[1]])) {
                                        this.board[i][cell[1]] += 1;
                                    }
                                }
                            }
                        })
                    }
                }

            })

            return this.board;
        }

        hit() {
            this.refreshBoard();

            let prey = [0, 0];

            let heatMap;

            if (this.hitStack.length) {
                heatMap = this.target();
            } else {
                heatMap = this.hunt();
            }

            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.board[prey[0]][prey[1]] < this.board[i][j]) {
                        prey = [i, j];
                    }
                }
            }

            return {
                board: this.board,
                prey: prey,
                callback: (response) => {
                    // console.log(response)
                    if (response === 'hit') {
                        this.hitStack.push(prey);
                    } else if (response === 'sunk') {
                        this.hitStack.push(prey);
                        while (this.hitStack.length) {
                            this.splitAreas(this.hitStack.pop());
                        }
                    } else {
                        this.splitAreas(prey);
                    }
                }
            }
        }

    }

    const dimensions = {
        width: 300,
        height: 300,
        margin: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
        },
    }

    let game = new SmartPlayer();
    let afterHit = game.hit();
    let visboard = afterHit.board;
    drawHitMap();

    function responsivefy(svg) {
        const container = d3.select(svg.node().parentNode);
        const width = parseInt(svg.style('width'));
        const height = parseInt(svg.style("height"));
        const aspect = width / height;

        svg.attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRation", "xMinYMid")
            .call(resize);

        d3.select(window).on("resize." + container.attr("id"), resize);

        function resize(params) {
            const targetWidth = parseInt(container.style("width"));
            svg.attr("width", targetWidth);
            svg.attr("height", Math.round(targetWidth / aspect));
        }

    }

    function drawHitMap () {
        let afterHit = game.hit();

        visboard = afterHit.board;
        afterHit.callback('miss');
        d3.select(".vis svg").data([]).exit().remove();

        const svg = d3.select(".vis").append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .style("margin-left", dimensions.margin.left + "px")
            .style("z-index", "100")
            .append("g")
            .attr("transform", `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
            .call(responsivefy);

        if (visboard) {
            const max = visboard.reduce((m, row) => {
                let localMax = row.reduce((soFar, v) => {
                                        return v > soFar ? v : soFar;
                                    }, 0)
                return localMax > m ? localMax : m;
            }, 0 );
            var x = d3.scaleBand()
                .domain(d3.range(visboard.length))
                .range([0, dimensions.width]);

            var y = d3.scaleBand()
                .domain(d3.range(visboard.length))
                .range([0, dimensions.height]);

            var color = d3.scaleSequential(d3.interpolatePlasma)
                .domain([0, max]);

            var row = svg.selectAll(".row")
                .data(visboard)
                .enter().append("g")
                .attr("class", "row")
                .attr("transform", (d, i) => `translate(0,${y(i)})`);

            row.selectAll(".cell")
                .data(d => d)
                .enter().append("rect")
                .attr("x", (d, i) => x(i))
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", d => color(d))
            // .style("fill-opacity", '0.7');
        }
    }


    $('#playHeatMap').click(() => {
        drawHitMap();
    })

    $('#Refresh').click(() => {
        game = new SmartPlayer();
        game.hit();
        game.hit();
        drawHitMap();
    })
})()