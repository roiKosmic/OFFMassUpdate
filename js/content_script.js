var form_template = "<div id='form'>"
					+"<div class='upBar'><input type='checkbox' id='selectAll'>&nbsp;Select All</input><div class='copyButton'>"+chrome.i18n.getMessage('copyLabel')+"</div></div>"
					+"<div>"+chrome.i18n.getMessage('fieldToUpdateLabel')+"</div>" 
				   +"<select id='champ'>"
				   +"				<option value='add_packaging' field='packaging'>"+chrome.i18n.getMessage('packagingLabel')+"</option>"
				    +"				<option value='add_brands' field='brands'>"+chrome.i18n.getMessage('brandsLabel')+"</option>"
					+"				<option value='add_categories' field='categories'>"+chrome.i18n.getMessage('categoriesLabel')+"</option>"
					+"				<option value='add_labels' field='labels'>"+chrome.i18n.getMessage('certificationsLabel')+"</option>"
					+"				<option value='add_origins' field='origins'>"+chrome.i18n.getMessage('originsLabel')+"</option>"
					+"				<option value='add_manufacturing_places' field='manufacturing_places'>"+chrome.i18n.getMessage('manufacturingLabel')+"</option>"
					+"				<option value='add_purchase_places' field='purchase_places'>"+chrome.i18n.getMessage('purchasingLabel')+"</option>"
					+"				<option value='add_stores' field='stores'>"+chrome.i18n.getMessage('storesLabel')+"</option>"
					+"				<option value='add_countries' field='countries'>"+chrome.i18n.getMessage('countriesLabel')+"</option>"
					+"				<option value='quantity' field='quantity'>"+chrome.i18n.getMessage('quantityLabel')+"</option>"
				    +"</select>"
					+"<div id='tagsHidder'><input name='tags' id='tags' value='' /></div>"
					+"<input name='quantity' id='quantity' type='text' value='' />"
					+"<div class='massFormButton update'>Update</div>"
					+"</div>"
					+"<div id='spinner'>"
					+chrome.i18n.getMessage('editLabel')+"<span id='pNumber'>0</span>"+chrome.i18n.getMessage('editNextLabel')
					+"     <div class='counter'>"+chrome.i18n.getMessage('successLabel')+"&nbsp;<div id='sNumber'>0</div></div>"
					+"     <div class='counter'>"+chrome.i18n.getMessage('failureLabel')+"&nbsp;<div id='eNumber'>0</div></div>"
					+"	   <div id='backButton'> < "+chrome.i18n.getMessage('backLabel')+"</div>"
					+"</div>";

var ingredient_popup_template =   "<div class='popup_div'>"
								+ "<div class='ingredientTitle'>Listes des ingrédients:</div>"
								+ "<textarea  id='ingredients'></textarea>"
								+ "<div class='massFormButton close'>Close</div>"
								+ "</div>";

var api_url = "/cgi/product_jqm2.pl?";
var api_autocomplete_url =  "/cgi/suggest.pl?";
var sField='packaging';
var lang='';
var productToUpdate=0;

$(document).ready(function(){

if(isConnected()){
	if($(".products").length){
		lang = $("html").attr("lang")
		addingCheckBox();
		addingIngredientsFormBtn();
		addingMassButton();
		
		$('#tags').tagsInput(
		{
		
		onChange: function(){
			console.log("Tags updated");
			chrome.storage.local.set({"tags":$('#tags').val()});
		},
		autocomplete_url: function(request, response) {
          url = api_autocomplete_url+"lc="+lang+"&tagtype="+sField+"&string="+request.term;
          $.get(url, function(data){
              //data = JSON.parse(data);
              response(data);
          });
		}
		}
		);
		
		
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

function addingIngredientsFormBtn(){
$('body').append(ingredient_popup_template);
$('.popup_div').hide();
$(".products > li").append("<input class='ingredientsFormBtn' type='button' value='i'/>");
	$('.ingredientsFormBtn').click(function(){
		var popup_div = $('.popup_div');
        var obj = $(this);
        var offset = obj.offset();
        var new_top = offset.top + 30;
        var new_left = offset.left;
        
        new_left = new_left - ( popup_div.width() / 2);
        new_left = new_left + ( obj.width() / 2);
        
        popup_div.css('left', new_left + 'px');
        popup_div.css('top', new_top + 'px');
        var clickedProduct = $(this).prev('.massUpdateCheckbox').attr('value');
		console.log("clicked product "+clickedProduct);
		addIngredientToForm(clickedProduct);
        popup_div.show();
	
	});
	
	
	$('.close').click(function(){
		$('.popup_div').hide();
	});
}

function addIngredientToForm(product){
	var api_url = "/api/v0/product/"+product+"?fields=ingredients_text_"+lang;
	var product_lang_info = "ingredients_text_"+lang;
	$.getJSON( api_url, function( data ){
		if(data.product[product_lang_info] !=null){
			console.log("Json :"+data.product[product_lang_info]);
			$("#ingredients").val(data.product[product_lang_info]);
			
		}
	}
	);	

}
function addingMassButton(){
	$("body").append("<div class='massUpdater'><div class='massButton'>&nbsp;</div><div class='massForms'>"+form_template+"</div></div>");
	$('.massForms').hide();
	$('#spinner').hide();
	
	
	initValue();
	
	$(".massButton").click(function(){
		if($(".massForms").is(":hidden")){
			$('.massForms').show();
			$(".massButton").css("background-color","blue");
			chrome.storage.local.set({"visible":true});
			
		}else{
			$('.massForms').hide();
			$(".massButton").css("background-color","white");
			clearAllField();
			
			$("#tagsHidder").show();
			$("#quantity").hide();
		}
	
	});
	
	$("#backButton").click(function(){
		$("#backButton").hide();
		$("#spinner").hide();
		$('#selectAll').prop("checked",false);
		$("#form").show();
		
		resetCounter();
	});
	
	$("#quantity").change(function(){
		var q = $(this).val();
		chrome.storage.local.set({"quantity":q});
	});
	
	$(".update").click(function(){
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
	
	
	
	
	$('#champ').change(function(){	
		sField = $('#champ').find(':selected').attr("field");
		chrome.storage.local.set({"selectedField":sField});
		console.log("Setting: "+sField);
		if(sField==='quantity'){
			$("#tagsHidder").hide();
			$("#quantity").show();
		}else{
			$("#tagsHidder").show();
			$("#quantity").hide();
		
		}
	});

	$(".copyButton").click(function(){
		var codes ='';
		$('.massUpdateCheckbox').each(function(){
			if($(this).is(':checked')){
				codes = codes + $(this).attr("value") + "\n";
			}	
		});
		
		navigator.clipboard.writeText(codes)
		.then(() => {
			console.log('Text copied to clipboard');
		})
		.catch(err => {
			// This can happen if the user denies clipboard permissions:
			console.error('Could not copy text: ', err);
		});
		
	});
	
	
}




function initValue(){
	chrome.storage.local.get(['selectedField'],function(result){
		if(result.selectedField != null){
			$("#champ > option[field='"+result.selectedField+"']").prop("selected",true);
			console.log("getting:" + result.selectedField);
			sField= result.selectedField;
		if(sField==='quantity'){
			$("#tagsHidder").hide();
			$("#quantity").show();
		}else{
			$("#tagsHidder").show();
			$("#quantity").hide();
		
		}
		}
	});
	
	chrome.storage.local.get(['tags'],function(result){
		if(result.tags != null){
			$('#tags').importTags(result.tags);
		}
	}
	);
	
	chrome.storage.local.get(['quantity'],function(result){
		if(result.quantity != null){
			$('#quantity').val(result.quantity);
		}
	}
	);
	
	chrome.storage.local.get(['visible'],function(result){
		if(result.visible == true){
			$('.massForms').show();
			$(".massButton").css("background-color","blue");
			
		}else{
			$('.massForms').hide();
			$(".massButton").css("background-color","white");
		}
	});
	
	
	
}

function sendMassUpdate(){

	var mySelect = $('#champ');
    var selectedField = mySelect.find(':selected').val()
	
	productToUpdate= $('.massUpdateCheckbox:checked').length;
	
	$('.massUpdateCheckbox').each(function(){
		if($(this).is(':checked')){
			var remote_url = api_url+"code="+$(this).attr("value")+"&lc="+lang+"&comment="+encodeURIComponent(chrome.i18n.getMessage("extComment"))+"&"+selectedField+"=";
			if(sField==='quantity'){
				remote_url += encodeURIComponent($("#quantity").val());
			}else{
				remote_url += encodeURIComponent($('#tags').val());
			}
			
			console.log("Sending Get request to "+remote_url+"\n");
			 $.ajax({
				type: "GET",
				url: remote_url,
				
				success: function (result) {
					incrSuccessCounter();
					productToUpdate--;
					updateProductCounter();
					if(productToUpdate <=0) $('#backButton').show();
				},
				error: function(){
					incrFailureCounter();
					productToUpdate--;
					updateProductCounter();
					if(productToUpdate <=0) $('#backButton').show();
				}
			});
			
			$(this).prop('checked',false);
		}
	
	
	});
	
	

}

function clearAllField(){
	chrome.storage.local.clear();
	$('#tags').importTags("");
	$("#quantity").val("");
	$("#champ > option[field='packaging']").prop("selected",true);
	sField='packaging';
	$('.massUpdateCheckbox').prop("checked",false);
	$('#selectAll').prop("checked",false);
	

}
function incrFailureCounter(){
	var x = parseInt($("#eNumber").html()) +1;
	$("#eNumber").html(x);
}

function incrSuccessCounter(){
	var x = parseInt($("#sNumber").html()) +1; 
	$("#sNumber").html(x);
	
}

function updateProductCounter(){
	$("#pNumber").html(productToUpdate);

}
function resetCounter(){
	$("#eNumber").html("0");
	$("#sNumber").html("0");
	$("#pNumber").html("0");
}
