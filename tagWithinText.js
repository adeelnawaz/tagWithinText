(function ($, undefined) {
    $.fn.tagWithinText = function(options) {
                    
        var settings = $.extend({
            "wrap": null, // function: to wrap the tag before showing. Only works with <div contenteditable=true
            "source" : null // array | function: array or function returning array to provide autocomplete options
        }, options);
                    
        $(this).each(function(){
            var $this = $(this);
                        
            var searchHandler = function( event, ui ) {
                $this.data('textToSearch', '');

                var text = $this._val();

                if(text == ''){
                    event.preventDefault();
                    return;
                }
                
                var position = getCursorPosition();
                text = text.substr(0, position);

                if(text == ''){
                    event.preventDefault();
                    return;
                }

                var lastSpace = text.lastIndexOf(' ');
                var lastNL = text.lastIndexOf('\n');
                
                var splitter = lastSpace > lastNL ? lastSpace : lastNL;
                splitter = splitter >= 0 ? splitter + 1 : 0;
                
                text = text.substr(splitter);

                if(text.substr(0, 1) != '#' || text == '#'){
                    event.preventDefault();
                    return;
                }
                
                text = text.substr(1);
                
                $this.data('textToSearch', text);
            }
                        
            var sourceHandler = function(request, response){
                //$this = $(this);
                var text = $this.data('textToSearch');
                var source = null;
                
                if(typeof settings.source == 'function'){
                    source = settings.source.call($this, text);
                } else {
                    source = settings.source;
                }

                var result = new Array();

                $.each(source, function(index, value){
                    var matchWith = null;
                    
                    if(typeof value == 'String'){
                        matchWith = value;
                    }else{
                        matchWith = value.label;
                    }
                    if(matchWith.indexOf(text) != -1){
                        result.push(value);
                    }
                });
                response(result);
            }
                        
            var selectHandler = function( event, ui ){
                event.preventDefault();
                
                var autocomplete = ui.item.value;
                var text = $this.data('textToSearch');
                var textAreaVal = $this._val();//get along with html
                var position = getCursorPosition();
                
                textAreaVal = new Array(textAreaVal.substr(0, position), textAreaVal.substr(position));

                textAreaVal[0] = textAreaVal[0].replace(new RegExp('#'+text+'$'), autocomplete);
                
                textAreaVal = textAreaVal[0] + textAreaVal[1];
                
                $this._val(textAreaVal);
            }
                        
            var focusHandler = function(event, ui){
                event.preventDefault();
            }
            
            var getCursorPosition = function() {
                var el = $this.get(0);
                if($this.is('div')){
                    return getCaretCharacterOffsetWithin(el);
                }
                var pos = 0;
                if('selectionStart' in el) {
                    pos = el.selectionStart;
                } else if('selection' in document) {
                    el.focus();
                    var Sel = document.selection.createRange();
                    var SelLength = document.selection.createRange().text.length;
                    Sel.moveStart('character', -el.value.length);
                    pos = Sel.text.length - SelLength;
                }
                return pos;
            }
            
            var getCaretCharacterOffsetWithin = function(element) {
                var caretOffset = 0;
                if (typeof window.getSelection != "undefined") {
                    var range = window.getSelection().getRangeAt(0);
                    var preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    
                    var clonedSelection = preCaretRange.cloneContents(),
                    div = document.createElement('div');
                    div.appendChild(clonedSelection);
                    
                    caretOffset = div.innerHTML.length;
                } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
                    console.log('Untested for this browser. Report on github if buggy');
                    var textRange = document.selection.createRange();
                    var preCaretTextRange = document.body.createTextRange();
                    preCaretTextRange.moveToElementText(element);
                    preCaretTextRange.setEndPoint("EndToEnd", textRange);
                    //caretOffset = preCaretTextRange.text.length;
                    
                    var clonedSelection = preCaretTextRange.cloneContents(),
                    div = document.createElement('div');
                    div.appendChild(clonedSelection);
                    
                    caretOffset = div.innerHTML.length;
                }
                return caretOffset;
            }
            
            $this._val = function(value){
                var funcToCall = null;
                if($this.is('input[type=text],textarea')){
                    funcToCall = $.fn.val;
                }else{
                    funcToCall = $.fn.html;
                }
                if(value == null){
                    return funcToCall.call($this);
                }else{
                    return funcToCall.call($this,value);
                }
            }
            
            $this.autocomplete({
                source: sourceHandler,
                search: searchHandler,
                select: selectHandler,
                focus: focusHandler
            });
        });
    }
})(jQuery);