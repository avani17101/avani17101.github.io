/* 
 * Script de gestion pour qm_messages
 * Fahri Tardif - Qc Média 
 * Aout 2015
 */

var C_PREF = "UdeMmsgC";
var EXPIRE = 90;
Cookies.withAttributes({ expires: EXPIRE});

// Pour messages de type "événement" & "programmes"
function initMessages(){
    $progsMsg = $('div[data-jsid]');
    $progsMsg.each(function(){
        var $msg = $(this);
        var myId = $msg.attr('data-jsid');
        // Cookies control
        if( !!Cookies.get( C_PREF + myId ) === true){
            $msg.remove();
        }else{
            if($msg.attr('data-persistent') != 'true') {
                $msg.find('button.alertClose, a.alertClose').one('click', function () {
                    Cookies.set(C_PREF + myId, 'hidden');
                });
            }
        }
        
        // Delay control
        if( $msg.attr('data-delay') ){
            var delay = parseInt($msg.attr('data-delay'), 10);
            $msg.hide();
            window.setTimeout(function(){
                $msg.fadeIn();
            }, delay);
        }
    });
}

function initMsgTop(){
    $('.bannerTop').each(function(){
        $('body').prepend( $(this).html() ); 
    });
}

function initMsgSliderPopup(){
    var $msg = $('[data-slidejsid]');
    var myId = $msg.attr('data-slidejsid');

    // Cookies control
    if( !!Cookies.get( C_PREF + myId ) === true ){
        $msg.remove();
    }else{
        //var $img = $('#msgSliderPopup img');
        //$('#msgSliderPopup img').remove();
        var $img = $('#msgSliderPopup a img').length ? $('#msgSliderPopup img').parent('a') : $('#msgSliderPopup img');
        $img.remove();

        $('#msgSliderPopup .popup-slider-body').append($img);
        $('body').append( $('#msgSliderPopup').html() );

        if( $msg.attr('data-delay') ){
            var delay = parseInt($msg.attr('data-delay'), 10);
            $('[data-slidejsid]').css('bottom', '-2000px');
            window.setTimeout(function(){
                $('[data-slidejsid]').animate({
                    'bottom':'0'
                }, 1000);
            }, delay);
        }

        $('[data-slidejsid] a.alertClose').one('click', function(){
            $(this).parents('.popup-slider').remove();
            Cookies.set( C_PREF + myId, 'hidden' );
        });
    }
}

/** Dev clear all msg cookies **/
function clearMsgCookies(){
    var cookieCol = Cookies.get();
    for (var property in cookieCol) {
        if (cookieCol.hasOwnProperty(property)) {
            if( cookieCol[property] === 'hidden'){
                Cookies.remove(property);
            }
        }
    }
}
/** Dev list all msg cookies **/
function getAllMsgCookies(){
    var cookieCol = ( Cookies.get() );
    for (var property in cookieCol) {
        if (cookieCol.hasOwnProperty(property)) {
            if( cookieCol[property] === 'hidden'){
                console.log(property);
            }
        }
    }
}


