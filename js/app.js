document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", onBackButton, false);
}
function onBackButton(){
	navigator.app.exitApp();
}
$(document).on("pageshow", function(){ ScaleContentToDevice(); });
$( document ).ready(function() {
	
	getHermandades();
	
	asociarEventos();

	//Preparado para almacenar selección
	var idHermandadStored = localStorage.getItem('idHermandad'); 
	if(idHermandadStored===null){ 
		//no hay datos almacenados
		
	}else{
					
	}

	StatusBar.hide();
	navigator.splashscreen.hide();
});


function getEnvelope(features){
	var xmin=180, ymin=90, xmax=-180, ymax=-90;
	
	$.each(features, function (index, value) {
		if (value.geometry.coordinates[0] < xmin){
	    	xmin=value.geometry.coordinates[0];
	    }
	    if (value.geometry.coordinates[0] > xmax){
	    	xmax=value.geometry.coordinates[0];
	    } 
	    if (value.geometry.coordinates[1] < ymin) {
	    	ymin=value.geometry.coordinates[1];
	    }
	    if (value.geometry.coordinates[1] > ymax){ 
	    	ymax=value.geometry.coordinates[1];
	    }
	});	
	
	return [xmin,ymin,xmax,ymax];	
}


var idSel=0;
function getHermandades(){
	startLoad();
	$.getJSON(urlService,{
		format: "geojson",
		auth: claveAuth,
		emp: idEmp
	})
		.done(function (data){
			hermandades = data;
			hermandades.bbox = getEnvelope(data.features);
			
			$("#dropHermandades").empty();
			$.each(data.features, function (index, value) {
				$("#dropHermandades").append('<option value="'+value.properties.id+'">'+value.properties.name+'</option>');		    
			});
			$("#dropHermandades>option").tsort({charOrder:'a[á]c{ch}e[é]i[í]l{ll}nño[ó]u[ú]y[ý]'});
			$("#dropHermandades").prepend("<option value=0>Todas</option>");
			$("#dropHermandades").val(idSel).selectmenu().selectmenu("refresh").change();
						
		})
		.fail(function (jqXHR, textStatus){
			console.log(textStatus);
		})
		.always(function(){
			//stopLoad();
		});
}

function asociarEventos(){
	
	$(window).on('resize orientationchange', function(){ ScaleContentToDevice(); });
	$('#mapea').on('load', function(){
		stopLoad();
	});

	$('#dropHermandades').change(function(e){

		idSel= $(this).val();
		if (idSel==0){
			zoomToAll();
		}else{
			$.each(hermandades.features, function (index, value) {
				if(value.properties.id == idSel){
					setHermandad(value);
					return;
				}
			});
		}
	});
}
function zoomToAll(){
	xy1proj=proj4(prj25830,[hermandades.bbox[0],hermandades.bbox[1]]);
	xy2proj=proj4(prj25830,[hermandades.bbox[2],hermandades.bbox[3]]);
	setIframeSrc(urlMapeaBase + "&layers=KML*Carretas*" + encodeURIComponent(urlService + "?emp=" + idEmp + "&auth=" + claveAuth 
					+ "&format=kml") + "*true&bbox="+ xy1proj +","+ xy2proj);
}

function setHermandad(hermandad){
	posProj = proj4(prj25830,hermandad.geometry.coordinates);
	setIframeSrc(urlMapeaBase + "&layers=KML*"+hermandad.properties.name + "*"
					+ encodeURIComponent(urlService + "?emp=" + idEmp + "&auth=" + claveAuth 
					+ "&format=kml&id=" + hermandad.properties.id) + "*true&zoom=13&center=" + posProj);
}

function setIframeSrc(url){
	console.log(url);
	$("#mapea").attr("src",url);
}
function startLoad(){
	$.mobile.loading( "show",{});
}
function stopLoad(){
	$.mobile.loading( "hide",{});
}
function ScaleContentToDevice() {
	   scroll(0, 0);
	   
	   var headerHeight = $(".ui-header:visible").outerHeight();
	   var footerHeight = $(".ui-footer:visible").outerHeight();
	   var content = $(".ui-content:visible");

	   var viewportHeight = $(window).height();
	   var contentMargins =  content.outerHeight() - content.height();
	   var contentheight = viewportHeight - headerHeight - footerHeight - contentMargins;

	   content.height(contentheight);
}
