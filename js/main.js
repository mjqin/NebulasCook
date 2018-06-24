
var chainnetConfig = {
    mainnet: {
        name: "主网",
        contractAddress: "n1ja1ixGLhHbQKqqbEh5kJ9KPWNKGPN8PTc",
        host: "https://mainnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/mainnet/pay"
    }
}

var chainInfo = chainnetConfig["mainnet"];
var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Unit = require("nebulas").Unit;
var Utils = require("nebulas").Utils;

var myneb = new Neb();
myneb.setRequest(new HttpRequest(chainInfo.host));
var nasApi = myneb.api;


var NebPay = require("nebpay");
var nebPay = new NebPay();
var dappAddress = chainInfo.contractAddress;

if (typeof(webExtensionWallet) === "undefined") {
    alert("请首先安装webExtensionWallet插件");
} 

$(function(){

	'use strict';

	var carousel  = function() {
		$('.owl-carousel').owlCarousel({
			loop: true,
			margin: 10,
			nav: true,
			stagePadding: 5,
			navText: ['<span class="icon-chevron-left">', '<span class="icon-chevron-right">'],
			responsive:{
				0:{
					items: 1
				},
				600:{
					items: 2
				},
				1000:{
					items: 3
				}
			}
		});
	}
	carousel();

	var toggleMenu = function() {
		var aside = $('.js-probootstrap-aside'),
			main = $('.js-probootstrap-main');
		$('.js-probootstrap-toggle').on('click', function(e) {
			aside.addClass('active');
			main.addClass('mobile-open');
			e.preventDefault();
		});
		$('.js-probootstrap-close-menu').on('click', function(e) {
			aside.removeClass('active');
			main.removeClass('mobile-open');
			e.preventDefault();
		});

		$(document).mouseup(function(e) {
			var container = $(".probootstrap-aside");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	      aside.removeClass('active');
	      main.removeClass('mobile-open');
	    }
    });
    
	};
	toggleMenu();

	var contentWayPoint = function() {
		var i = 0;
		jQuery('.probootstrap-animate').waypoint( function( direction ) {

			if( direction === 'down' && !jQuery(this.element).hasClass('probootstrap-animated') ) {
				
				i++;

				jQuery(this.element).addClass('item-animate');
				setTimeout(function(){

					jQuery('body .probootstrap-animate.item-animate').each(function(k){
						var el = jQuery(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn probootstrap-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft probootstrap-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight probootstrap-animated');
							} else {
								el.addClass('fadeInUp probootstrap-animated');
							}
							el.removeClass('item-animate');
						},  k * 50, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '95%' } );
	};
	contentWayPoint();

	if ($('.probootstrap-main').length > 0 ) {
		$('.probootstrap-main').imagesLoaded( {
		  
		  },
		  function() {
		  	if ($('.card').length > 0 ) {
		    	$('.card').addClass('img-loaded');
		    }
		  }
		);
	}

	// create new recipe
	$("#submit").on('click', function () {
        var recipeName = $("#recipeName").val(), 
        	imageLink = $("#imageLink").val(),
        	description = $("#description").val(), 
        	materials = $("#materials").val(), 
        	procedure = $("#procedure").val();

        if(recipeName == "" || recipeName == null){
        	alert("Recipe name must not be empty!");
        	return;
        }

        if(imageLink == "" || imageLink == null){
        	alert("Image Link must not be empty!");
        	return;
        }

        if(description == "" || description == null){
        	alert("Description must not be empty!");
        	return;
        }

        if(materials == "" || materials == null){
        	alert("Materials must not be empty!");
        	return;
        }

        if(procedure == "" || procedure == null){
        	alert("Procedure name must not be empty!");
        	return;
        }

        var to = dappAddress;
        var value = "0";
        var callFunction = "addNewRecipe";
        var callArgs = "[\"" + recipeName + "\",\"" + description + "\",\"" + materials + "\",\"" + 
                                procedure + "\",\"" + imageLink + "\"]";
        nebPay.call(to, value, callFunction, callArgs, {
            listener: createHandle
        });
        $("#mask").css({ display: 'block' });
        $("#spinner").css({ display: 'block' });
    });

    function createHandle(resp){
    	if( resp.txhash != null) {
            checkTxStatus(resp.txhash);
        }
        else {
            alert("创建失败请重试！");
            $("#mask").css({ display: 'none' });
            $("#spinner").css({ display: 'none' });
        }
    }

    function checkTxStatus(txhash){
          var timerId = setInterval(function(){
            nasApi.getTransactionReceipt({
                hash:txhash
            }).then(function(receipt){
            	console.log(receipt);
                if(receipt.status == 1){
                    clearInterval(timerId);
                    var res = receipt.execute_result;
                    console.log("status:"+res);
                    alert("创建成功！");
                    $("#spinner").css({ display: 'none' });
                    $("#mask").css({ display: 'none' });
                }else if(receipt.status == 0){
                    clearInterval(timerId);
                    console.log("status err:"+receipt.execute_error);
                    alert(receipt.execute_error);
                    $("#spinner").css({ display: 'none' });
                    $("#mask").css({ display: 'none' });
                }
                
            }).catch(function(err){
                console.log("check error");
            });
        },3*1000);
    }

});


// communication with nebulas
function getFromNebulas(){
	var to = dappAddress;
    var value = "0";
    var callFunction = "searchRecipe";
    var callArgs = "";
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        listener: searchHandle
    });
}

function searchHandle(resp){
	if(resp.execute_err != "") {
		alert("查询失败，请刷新页面！");
		return;
	}
	var result = JSON.parse(resp.result);
	sessionStorage.setItem('recipes', resp.result);
	$("#loading").css({ display: 'none' });
	for(var x in result){
		var imageLink = result[x].imageLink;
		if(imageLink == null || imageLink == "" || !imageLink.startsWith("http")) continue;
		image =  new Image();
		image.src = imageLink;
		var content = "<div class='card img-loaded'>" + 
      					"<a href='single.html?" + x + "'>" + 
        				"<img id='img" + x  + "' src=\"" +  imageLink + "\">" + 
      					"</a></div>";

		$("#recipe_content").append(content);
		$("#img" + x).attr("class", "card-img-top probootstrap-animate fadeInUp probootstrap-animated");
	}
}



// show recipe
function showRecipe(){

	String.prototype.replaceAll  = function(s1,s2){   
		return this.replace(new RegExp(s1,"gm"),s2);   
	}

	var para = window.location.search;
	var cur = Number(para.substr(1));
	console.log(cur);
	var result = JSON.parse(sessionStorage.getItem('recipes'));
	console.log(result);

	var item = result[cur];
	var procedure = item.procedure.replaceAll('\n','</br>'); 
	var materials = item.materials.replaceAll('\n','</br>'); 
	console.log(procedure);

	$("#recipe_img").attr("src", item.imageLink);
	$(".mb-8").attr("style", "text-align:center");

	$("#recipeName").text(item.name);
	$("#description").text(item.description);
	$("#materials").append(materials);
	$("#procedure").append(procedure);
}