var form_template = "<div id='form'>"
					+"<input type='checkbox' id='selectAll'>&nbsp;Select All</input>"
					+"<div>Champ à modifier:</div>" 
				   +"<select id='champ'>"
				   +"				<option value='add_packaging'>Conditionnement</option>"
				    +"				<option value='add_brands'>Marques</option>"
					+"				<option value='add_categories'>Catégories</option>"
					+"				<option value='add_labels'>Label,certifications,récompenses</option>"
					+"				<option value='add_origins'>Origines des ingrédients</option>"
					+"				<option value='add_manufacturing_places'>Lieux de fabrication ou de transformation</option>"
					+"				<option value='add_purchase_places'>Ville et pays d'achat</option>"
					+"				<option value='add_stores'>Magasins</option>"
					+"				<option value='add_countries'>Pays de vente</option>"
				    +"</select>"
					+"<input name='tags' id='tags' value='' />"
					+"<div class='massFormButton'>Update</div>"
					+"</div>"
					+"<div id='spinner'>"
					+"Edition en masse en cours : "
					+"     <div class='counter'>Succes:&nbsp;<div id='sNumber'>0</div></div>"
					+"     <div class='counter'>Erreur:&nbsp;<div id='eNumber'>0</div></div>"
					+"	   <div id='backButton'> < Retour </div>"
					+"</div>";

var api_url = "/cgi/product_jqm2.pl?";

$(document).ready(function(){
if(isConnected()){
	if($(".products").length){
		addingCheckBox();
		addingMassButton();
		$('#tags').tagsInput();
		
	}
	
}
});

function isConnected(){
	if($("input[name='user_id']").length) return false;
	return true;

}
function addingCheckBox(){
	console.log("Adding check box");
	$(".products > li").append("<input class='massUpdateCheckbox' type='checkbox' value=''/>");
	
	$('.massUpdateCheckbox').each(function(){
		var myAnchor= $(this).parent().find("a");
		var myHref = myAnchor.attr("href");
		
		//var myRe = /\/(\w+)\/(\d+)\/(\w+)/;
		var myRe = /\/(\w+)\/(\d+)([\/|\w]*)/
		var result = myRe.exec(myHref);
		$(this).attr('value',result[2]);
		console.log("Value :"+result[2]);
	});
	

}

function addingMassButton(){
	$("body").append("<div class='massUpdater'><div class='massButton'>&nbsp;</div><div class='massForms'>"+form_template+"</div></div>");
	$('.massForms').hide();
	$('#spinner').hide();
	$(".massButton").click(function(){
		if($(".massForms").is(":hidden")){
			$('.massForms').show();
			$(".massButton").css("background-color","blue");
		}else{
			$('.massForms').hide();
			$(".massButton").css("background-color","white");
		}
	
	});
	
	$("#backButton").click(function(){
		$("#backButton").hide();
		$("#spinner").hide();
		$("#form").show();
		resetCounter();
	});
	
	$(".massFormButton").click(function(){
		$("#spinner").show();
		$("#form").hide();
		$("#backButton").hide();
		sendMassUpdate();
	
	});
	
	$('#selectAll').change(function(){
		if($(this).is(':checked')){
			$('.massUpdateCheckbox').prop("checked",true);
		}else{
			$('.massUpdateCheckbox').prop("checked",false);
		}
	
	});

}

function sendMassUpdate(){

	var mySelect = $('#champ');
    var selectedField = mySelect.find(':selected').val()
	var lang = $("html").attr("lang");
	$('.massUpdateCheckbox').each(function(){
		if($(this).is(':checked')){
			var remote_url = api_url+"code="+$(this).attr("value")+"&lc="+lang+"&comment="+chrome.i18n.getMessage("extComment")+"&"+selectedField+"="+$('#tags').val();
			console.log("Sending Get request to "+remote_url+"\n");
			 $.ajax({
				type: "GET",
				url: remote_url,
				async: false,
				success: function (result) {
					incrSuccessCounter();
				},
				error: function(){
					incrFailureCounter();
				
				}
			});
			
			$(this).prop('checked',false);
		}
	
	
	});
	
	$('#backButton').show();

}
function incrFailureCounter(){
	var x = parseInt($("#eNumber").html()) +1;
	$("#eNumber").html(x);
}

function incrSuccessCounter(){
	var x = parseInt($("#sNumber").html()) +1; 
	$("#sNumber").html(x);
	
}

function resetCounter(){
	$("#eNumber").html("0");
	$("#sNumber").html("0");
}
