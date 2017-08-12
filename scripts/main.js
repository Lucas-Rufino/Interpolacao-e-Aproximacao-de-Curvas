const stroke_control = 2;
const stroke_circle = 2;
const radius_circle = 6;
const stroke_curve = 3;
const base_color = '#95a5a6';

var colors=[['#1abc9c', true],
            ['#2ecc71', true],
            ['#3498db', true],
            ['#9b59b6', true],
            ['#f1c40f', true],
            ['#e67e22', true],
            ['#e74c3c', true],
            ['#34495e', true],
            ['#16a085', true],
            ['#27ae60', true],
            ['#2980b9', true],
            ['#8e44ad', true],
            ['#f39c12', true],
            ['#d35400', true],
            ['#c0392b', true],
            ['#2c3e50', true],];
var curves = [];
var index = -1;
var cbAll = false;

insertGrid();
insertCurve([true, true, true, 200, false, false]);

function Curve(color, cbPoint, cbPolygon, cbCurve, nfEvaluation, cbInterpolation, cbExtrapolation) {
    var controlPoints;
    var controlPath;
    var curvePath;
    var cbPoints;
    var cbPolygon;
    var cbCurve;
    var nfEvaluation;
    var cbInterpolation;
    var cbExtrapolation;
    var color;
    var pascal;

    this.color = color;
    this.controlPoints = [];
    this.interPoints = [];
    this.controlPath = new Path().stroke(base_color, stroke_control).addTo(stage);
    this.curvePath = new Path().stroke(colors[this.color][0], stroke_curve).addTo(stage);
    this.cbPoints = cbPoint;
    this.cbPolygon = cbPolygon;
    this.cbCurve = cbCurve;
    this.nfEvaluation = nfEvaluation;
    this.cbInterpolation = cbInterpolation;
    this.cbExtrapolation = cbExtrapolation;
    this.pascal = [];
    
    this.calcPascal = function(){
        var max = this.controlPoints.length - 1;
        for(var n=this.pascal.length ; n<=max ; n++){
            this.pascal.push([1, 0]);
            for(var p=1 ; p<=n ; p++){
                this.pascal[n][p] = this.pascal[n-1][p-1] + this.pascal[n-1][p];
                this.pascal[n].push(0);
            }
        }
    };

    this.calcInterpolation = function(){
        this.interPoints = this.controlPath.segments();
        
        var bern = [];
        for(var j=0, n=this.interPoints.length-1 ; j<=n ; j++){
            bern.push([]);
            for(var i=0 ; i<=n ; i++){
                var pct = Math.pow(Math.sin(Math.PI*(j/n)/2), 2);
                bern[bern.length-1].push(this.bernstein(n, i, pct));
            }
        }
        
        for(var j=0, n = this.interPoints.length-1 ; j<=n ; j++){
            if(this.controlPoints[j][1]) continue;
            var x = 0, y = 0;
            var aux = this.controlPath.segments();
            for(var i=0 ; i<=n ; i++){
                var bernCoef = this.bernstein(n, i, j/n);
                x += aux[i][1]*bernCoef;
                y += aux[i][2]*bernCoef;
            }
            this.interPoints[j][1] = x;
            this.interPoints[j][2] = y;
        }
        
        for(var i=0, n=this.interPoints.length-1 ; i<=n ; i++){
            for(var j=0 ; j<=n ; j++){
                if(bern[j][i] != 0 && bern[j][i] != 1){
                    var div = bern[j][i];
                    for(var k=0 ; k<=n ; k++){
                        bern[j][k] /= div;
                    }
                    this.interPoints[j][1] /= div;
                    this.interPoints[j][2] /= div;
                }
            }

            for(var j=0 ; j<=n ; j++){
                if(bern[j][i] != 0 && j != i){
                    for(var k=0 ; k<=n ; k++){
                        bern[j][k] -= bern[i][k];
                    }
                    this.interPoints[j][1] -= this.interPoints[i][1];
                    this.interPoints[j][2] -= this.interPoints[i][2];
                }
            }
        }

        for(var j=1, n=this.interPoints.length-1 ; j<n ; j++){
            this.interPoints[j][1] /= bern[j][j];
            this.interPoints[j][2] /= bern[j][j];
            bern[j][j] = 1;
        }

        /*
        for(var j=0, n=this.interPoints.length-1 ; j<=n ; j++){
            var str = "";
            for(var k=0 ; k<=n ; k++){
                str += bern[j][k] + " ";
            }
            console.log(str + "| " + this.interPoints[j][1] + " " + this.interPoints[j][2]);
        }
        console.log("-----");
        */
    };
    
    this.bernstein = function(n, i, u){
        return (this.pascal[n][i] * Math.pow((1-u),n-i) * Math.pow(u,i));
    };

    this.getLengthPoints = function(){
        return this.controlPoints.length;
    };

    this.getColor = function(){
        return this.color;
    };

    this.getCBPoints = function(){
        return this.cbPoints;
    };

    this.getCBPolygon = function(){
        return this.cbPolygon;
    };

    this.getCBCurve = function(){
        return this.cbCurve;
    };

    this.getNFEvaluation = function(){
        return this.nfEvaluation;
    };
    
    this.getCBInterpolation = function(){
        return this.cbInterpolation;
    };
    
    this.getCBExtrapolation = function(){
        return this.cbExtrapolation;
    };

    this.setCBPoints = function(value){
        this.cbPoints = value;
    };

    this.setCBPolygon = function(value){
        this.cbPolygon = value;
    };

    this.setCBCurve = function(value){
        this.cbCurve = value;
    };

    this.setNFEvaluation = function(value){
        this.nfEvaluation = value;
    };
    
    this.setCBInterpolation = function(value){
        this.cbInterpolation = value;
        if(!this.cbInterpolation){
            for(var i=0, len=this.controlPoints.length ; i<len ; i++){
                this.controlPoints[i][1] = true;
            }
        }
    };
    
    this.setCBExtrapolation = function(value){
        this.cbExtrapolation = value;
    };

    this.insertPoint = function(x, y){
        this.controlPoints.push([new Circle(x, y, radius_circle).fill(base_color).stroke(colors[this.color][0], stroke_circle).addTo(stage), true]);
        if(this.controlPath.segments().length === 0) this.controlPath.moveTo(x, y);
        else this.controlPath.lineTo(x, y);
        this.calcPascal();
    };

    this.removePoint = function(obj){
        for(var i=0 ; i<this.controlPoints.length ; i++){
            if(this.controlPoints[i][0] == obj){
                stage.removeChild(this.controlPoints[i][0]);
                this.controlPoints.splice(i, 1);
                this.controlPath.clear();
                for(var i=0 ; i<this.controlPoints.length ; i++){
                    if(this.controlPath.segments().length === 0) this.controlPath.moveTo(this.controlPoints[i][0].attr('x'), this.controlPoints[i][0].attr('y'));
                    else this.controlPath.lineTo(this.controlPoints[i][0].attr('x'), this.controlPoints[i][0].attr('y'));
                }
                break;
            }
        }
    };

    this.redraw = function(id = -1){
        if(this.cbPoints){
            for(var i=0 ; i<this.controlPoints.length ; i++){
                this.controlPoints[i][0].attr('radius', radius_circle);
                this.controlPoints[i][0].attr('strokeWidth', stroke_circle);
            }
        } else {
            for(var i=0 ; i<this.controlPoints.length ; i++){
                this.controlPoints[i][0].attr('radius', 0);
                this.controlPoints[i][0].attr('strokeWidth', 0);
            }
        }

        if(id != -1) this.redrawControl(id);
        if(this.cbPolygon) this.controlPath.attr('strokeWidth', stroke_control);
        else this.controlPath.attr('strokeWidth', 0);

        if(this.cbCurve){
            this.redrawCurve();
            this.curvePath.attr('strokeWidth', stroke_curve);
        } else this.curvePath.attr('strokeWidth', 0);
    };

    this.redrawControl = function(id){
        var circleIndex = this.searchCircle(id);
        var segments = this.controlPath.segments();
        segments[circleIndex][1] = this.controlPoints[circleIndex][0].attr('x');
        segments[circleIndex][2] = this.controlPoints[circleIndex][0].attr('y');
        this.controlPath.segments(segments);
    };
    
    this.redrawCurve = function(){
        if(this.controlPoints.length >= 2){
            if(this.cbInterpolation) this.calcInterpolation();
            
            var step = 1/this.nfEvaluation;
            var aux = (this.cbInterpolation ? this.interPoints : this.controlPath.segments());
            var count = 0;
            
            this.curvePath.clear();
            this.curvePath.moveTo(this.controlPoints[0][0].attr('x'), this.controlPoints[0][0].attr('y'));
            for(var t=-step ; this.cbExtrapolation ; t-=step){
                var x = 0, y = 0;
                var pct = (this.cbInterpolation ? Math.floor((t+1)/2)*2+(Math.pow(-1, Math.floor(t)))*(Math.pow(Math.sin(Math.PI*t/2), 2)) : t);
                for(var i=0, n=aux.length-1 ; i<=n ; i++){
                    var bern = this.bernstein(n, i, pct);
                    x += aux[i][1]*bern;
                    y += aux[i][2]*bern;
                }
                this.curvePath.lineTo(x, y);
                if(x < 0 || y < 0 || x > stage.width || y > stage.height) break;
            }
            
            this.curvePath.moveTo(this.controlPoints[0][0].attr('x'), this.controlPoints[0][0].attr('y'));
            for(var t=step ; t<1 ; t+=step){
                var x = 0, y = 0;
                var pct = (this.cbInterpolation ? Math.pow(Math.sin(Math.PI*t/2), 2) : t);
                for(var i=0, n=aux.length-1 ; i<=n ; i++){
                    var bern = this.bernstein(n, i, pct);
                    x += aux[i][1]*bern;
                    y += aux[i][2]*bern;
                }
                this.curvePath.lineTo(x, y);
            }
            
            var final = this.controlPoints.length-1;
            this.curvePath.lineTo(this.controlPoints[final][0].attr('x'), this.controlPoints[final][0].attr('y'));
            for(var t=1+step ; this.cbExtrapolation ; t+=step){
                var x = 0, y = 0;
                var pct = (this.cbInterpolation ? Math.floor((t+1)/2)*2+(Math.pow(-1, Math.floor(t)))*(Math.pow(Math.sin(Math.PI*t/2), 2)) : t);
                for(var i=0, n=aux.length-1 ; i<=n ; i++){
                    var bern = this.bernstein(n, i, pct);
                    x += aux[i][1]*bern;
                    y += aux[i][2]*bern;
                }
                this.curvePath.lineTo(x, y);
                if(x < 0 || y < 0 || x > stage.width || y > stage.height) break;
            }
        } else {
            this.curvePath.clear();
            this.curvePath.moveTo(0, 0);
            this.curvePath.lineTo(0, 0);
        }
    };

    this.removeCurve = function(){
        stage.removeChild(this.controlPath);
        stage.removeChild(this.curvePath);
        for(var i=0 ; i<this.controlPoints.length ; i++){
            stage.removeChild(this.controlPoints[i][0]);
        }
    };

    this.searchCircle = function(id){
        var begin = 0, end = this.controlPoints.length-1;
        var mean, value;
        while (begin <= end){
            mean = parseInt((begin + end)/2);
            value = this.controlPoints[mean][0].id;
            if(id == value) return mean;
            if(id < value) end = mean-1;
            else begin = mean+1;
        }
        return -1;
    };
    
    this.changePropety = function(i){
        if(this.cbInterpolation){
            this.controlPoints[i][1] = !this.controlPoints[i][1];
        }
    }
}

function searchCurve(id){
    var curveIndex = -1;
    for(var i=0 ; i<curves.length && curveIndex==-1; i++){
        if(curves[i].searchCircle(id) != -1){
            curveIndex = i;
        }
    }
    return curveIndex;
}

function insertGrid(){
    for(var i=30 ; i<5000 ; i+=30){
        var path = new Path().stroke('#ecf0f1', 1).addTo(stage);
        path.moveTo(i, 0);
        path.lineTo(i, 5000);
        path = new Path().stroke('#ecf0f1', 1).addTo(stage);
        path.moveTo(0, i);
        path.lineTo(5000, i);
    }
    path = new Path().stroke('#bdc3c7', 1).addTo(stage);
    path.moveTo(0, 0);
    path.lineTo(0, 5000);
}

function findNextColor(){
    for(var i=0 ; i<colors.length ; i++){
        if(colors[i][1]){
            colors[i][1] = false;
            return i;
        }
    }
    return ((index+1)%colors.length);
}

function insertCurve(control){
    var color = findNextColor();
    var curve = new Curve(color, control[0], control[1], control[2], control[3], control[4], control[5]);
    curves.push(curve);
    stage.sendMessage('insertCurveHTML', {
        data: [curves.length, curve.getCBPoints(), curve.getCBPolygon(), curve.getCBCurve(), curve.getNFEvaluation(), curve.getCBInterpolation(), curve.getCBExtrapolation()]
    });
}

stage.on('message:insertCurve', function(data) {
    insertCurve(data.data);
})

stage.on('message:removeCurve', function(data) {
    if(index >= 0){
        var curve = curves[data.data];
        colors[curve.getColor()][1] = true;
        curves[data.data].removeCurve();
        curves.splice(data.data, 1);
        stage.sendMessage('removeCurveHTML', {});
    }
})

stage.on('message:selectCBAll', function(data) {
    cbAll = data.data;
    if(cbAll){
        var curve = curves[index];
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBPoints(curve.getCBPoints());
            curves[i].setCBPolygon(curve.getCBPolygon());
            curves[i].setCBCurve(curve.getCBCurve());
            curves[i].setNFEvaluation(curve.getNFEvaluation());
            curves[i].setCBInterpolation(curve.getCBInterpolation());
            curves[i].setCBExtrapolation(curve.getCBExtrapolation());
            curves[i].redraw();
        }
    }
})

stage.on('message:selectCBPoint', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBPoints(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
        curve.setCBPoints(data.data);
        curve.redraw();
    }
})

stage.on('message:selectCBPolygon', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBPolygon(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
       curve.setCBPolygon(data.data);
        curve.redraw();
    }
})

stage.on('message:selectCBCurve', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBCurve(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
        curve.setCBCurve(data.data);
        curve.redraw();
    }
})

stage.on('message:selectCBInterpolation', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBInterpolation(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
        curve.setCBInterpolation(data.data);
        curve.redraw();
    }
})

stage.on('message:selectCBExtrapolation', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setCBExtrapolation(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
        curve.setCBExtrapolation(data.data);
        curve.redraw();
    }
})

stage.on('message:modifyEvaluation', function(data) {
    if(cbAll){
        for(var i=0 ; i<curves.length ; i++){
            curves[i].setNFEvaluation(data.data);
            curves[i].redraw();
        }
    } else {
        var curve = curves[index];
        curve.setNFEvaluation(data.data);
        curve.redrawCurve();
    }
})

stage.on('message:selectCurve', function(data) {
    if(data.data >= 0){
        index = data.data;
        var curve = curves[data.data];
        stage.sendMessage('selectCurveHTML', {
            data: [curve.getCBPoints(), curve.getCBPolygon(), curve.getCBCurve(), curve.getNFEvaluation(), colors[curve.getColor()][0], curve.getCBInterpolation(), curve.getCBExtrapolation()]
        });
    } else {
        index = -1;
        stage.sendMessage('selectCurveHTML', {
            data: [true, true, true, 200, false, false]
        });
    }
})

var active = true;
stage.on('pointerdown', function(event) {
    if(index >= 0){
        if(!(event.target instanceof Circle)) {
            var curve = curves[index];
            curve.insertPoint(event.x, event.y);
            curve.redraw();
        } else {
            var point = event.target;
            var curve = curves[searchCurve(point.id)];
            var delay = 0;
            var max = curve.getLengthPoints()*curve.getNFEvaluation()/1600;
            
            point.on('drag', function(dEvent) {
                this.attr({x: dEvent.x, y: dEvent.y});
                curve.redrawControl(this.id);
                if(delay++ > max){
                    curve.redrawCurve();
                    delay = 0;
                }
            });

            point.on('pointerup', function(rEvent){
                if(delay != 0){
                    curve.redraw(point.id);
                    delay = 0;
                }
            });

            point.on('doubleclick', function(rEvent) {
                curve.removePoint(this);
                curve.redrawCurve();
            });
        }
    }
});

var flag = true;
stage.on('keydown', function(eventKey) {
    stage.on('pointerdown', function(eventMouse) {
        if(index >= 0 && flag && eventMouse.target instanceof Circle && eventKey.keyCode == 16){
            eventKey.keyCode = 0;
            var point = eventMouse.target;
            var curve = curves[searchCurve(point.id)];
            curve.changePropety(curve.searchCircle(point.id));
            curve.redrawCurve();
            flag = false;
        }
    });
});

stage.on('keyup', function(event) {
    flag = true;
});