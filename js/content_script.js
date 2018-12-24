var form_template = "<div>Champ à modifier:" 
				   +"<select>"
				   +"				<option>Conditionnement</option>"
				    +"				<option>Marques</option>"
					+"				<option>Catégories</option>"
					+"				<option>Label,certifications,récompenses</option>"
					+"				<option>Origines des ingrédients</option>"
					+"				<option>Lieux de fabrication ou de transformation</option>"
					+"				<option>Ville et pays d'achat</option>"
					+"				<option>Magasins</option>"
					+"				<option>Pays de vente</option>"
				   +"</select></div><input name='tags' id='tags' value='foo,bar,baz' />"

$(document).ready(function(){
	if($(".products").length){
		addingCheckBox();
		addingMassButton();
		$('#tags').tagsInput();
	}
});

function addingCheckBox(){
	console.log("Adding check box");
	$(".products > li").append("<input class='massUpdateCheckbox' type='checkbox' value=''/>");
	
	$('.massUpdateCheckbox').each(function(){
		var myAnchor= $(this).parent().find("a");
		var myHref = myAnchor.attr("href");
		
		var myRe = /\/(\w+)\/(\d+)\/(\w+)/;
		var result = myRe.exec(myHref);
		$(this).attr('value',result[2]);
		
	});
}

function addingMassButton(){
	$("body").append("<div class='massUpdater'><div class='massButton'>M</div><div class='massForms'>"+form_template+"</div></div>");
	$('.massForms').hide();
	$(".massButton").click(function(){
		if($(".massForms").is(":hidden")){
			$('.massForms').show();
			$(".massButton").css("background-color","blue");
		}else{
			$('.massForms').hide();
			$(".massButton").css("background-color","red");
		}
	
	});

}