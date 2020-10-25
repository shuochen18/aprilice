
var exportpdf=function(address, buildingshapes,tcount, tpower){
    var src1 = "../assets/tem1.jpg";
    var src2 = "../assets/tem2.jpg";
    var status = document.getElementById("dstatus");
    status.innerText = "  Vänta..."
    Promise.all([tobase64(src1),tobase64(src2)])
    .then((b1b2)=>format(b1b2[0],b1b2[1],address, buildingshapes,tcount, tpower))
}

function format(temp1, temp2,address, buildingshapes,tcount, tpower){
    var doc = new jsPDF(true);
    var types = [];
    buildingshapes.map(x=>{
        types.push(x.solartype-1);
    })
    console.log(types);
    types = new Set(types);
    var out =[];
    for(i of types){
        out.push(allsolartype[i][2])
    }
    doc.addImage(temp1, "JPEG", 0, 0,210,272);
    doc.setFontSize(15);
    doc.setTextColor(0,133,117);
    doc.text(`${address}`,41,167);
    doc.text(`${tcount}`,63,178);
    doc.text(`${buildingshapes.length}`,45,189);
    doc.text(`${out}`,52,200);
    doc.text(`${tpower.toFixed(2)}`,72,211);
    doc.text(`${(tpower*0.013).toFixed(2)} kg`,57,222);
    doc.text(`${(tpower*0.013/6000).toFixed(2)}`,73,233);

    // second page
    doc.addPage();

    html2canvas($('.gm-style')[0],
    {
      useCORS: true,
    }).then(canvas=>{return canvas.toDataURL('image/jpeg',1.0);})
    .then(mapurl=>{
        doc.addImage(temp2, "JPEG", 0, 0,210,262);
        var width = doc.internal.pageSize.width;    
        var height = doc.internal.pageSize.height;
        doc.addImage(mapurl, 'PNG', width/4, 75,width/2,height/2);
        doc.save("Aprilice_Report");
        document.getElementById("dstatus").innerText = "  Avslutad"
    })
}

function tobase64(src){
    return new Promise(resolve=>{
        var c1 = document.createElement("canvas");
        var i1 = document.createElement("img");
        i1.src = src;
        i1.onload = ()=>{
            c1.height = i1.height;
            c1.width = i1.width;
            var ctx = c1.getContext('2d');
            ctx.drawImage(i1, 0, 0, c1.width, c1.height);    
            var b1 = c1.toDataURL('image/jpeg', 1.0);
            resolve(b1);
        }
    })
}