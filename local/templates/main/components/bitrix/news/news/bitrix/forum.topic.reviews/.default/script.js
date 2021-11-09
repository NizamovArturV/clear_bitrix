;(function(window){
	BX.namespace("BX.Forum");
	var FTRList = function (params) {
		this.id = 'FTRList' + params.form.id;
		this.mess = {};
		this.form = params.form;
		if (!!params["id"]) {
			for (var ii = 0; ii < params["id"].length; ii++) {
				this.bind(params["id"][ii]);
			}
		}
		this.params = {
			preorder: (params.preorder == "Y"),
			pageNumber: params.pageNumber,
			pageCount: params.pageCount
		};
		BX.addCustomEvent(this.form, 'onAdd', BX.delegate(this.add, this));
		BX.addCustomEvent(this.form, 'onRequest', BX.delegate(function () {
			if (typeof this.params.pageNumber != 'undefined') {
				var pageNumberInput = this.form.elements["pageNumber"];
				if (!pageNumberInput) {
					pageNumberInput = BX.create("input", {props: {type: "hidden", name: 'pageNumber'}});
					this.form.appendChild(pageNumberInput);
				}
				pageNumberInput.value = this.params.pageNumber;
			}
			if (typeof this.params.pageCount != 'undefined') {
				var pageCountInput = BX.findChild(this.form, {attr: {name: 'pageCount'}});
				if (!pageCountInput) {
					pageCountInput = BX.create("input", {props: {type: "hidden", name: 'pageCount'}});
					this.form.appendChild(pageCountInput);
				}
				pageCountInput.value = this.params.pageCount;
			}
		}, this));
		BX.addCustomEvent(this.form, 'onResponse', BX.delegate(function () {
			var input_pageno = BX.findChild(this.form, { 'attr': { 'name': 'pageNumber' }}, true);
			if (input_pageno) {
				BX.remove(input_pageno);
			}
		}, this));
	};
	FTRList.prototype = {
		add : function(id, result)
		{
			var
				container = BX(this.form.id + 'container'),
				listform,
				post = {className: /reviews-reply-form|reviews-collapse/},
				msgNode = window.fTextToNode(result.message);
			if (! container)
			{
				container = BX.create('div', {
					'attrs' : {
						'id' : this.form.id + 'container'},
					'props': {
						'className': 'reviews-block-container reviews-reviews-block-container'},
					'children': [
						BX.create('div', {
							'props': {
								'className': 'reviews-block-outer'
							},
							'children': [
								BX.create('div', {
									'props': {
										'className': 'reviews-block-inner'
									}
								})
							]
						})
					]
				});
				window.fReplaceOrInsertNode(container, null, BX.findChild(document, post, true).parentNode, post);
				container = BX(this.form.id + 'container');
			}
			listform = (container ? BX.findChild(container, {className: 'reviews-block-inner'}, true) : null);
			if (msgNode && listform)
			{
				if (!!result["allMessages"])
				{
					window.fReplaceOrInsertNode(msgNode, listform, BX.findChild(document, post, true).parentNode, post);

					if (!!result.navigation && !!result.pageNumber)
					{
						var navDIV = window.fTextToNode(result.navigation), i,
							navPlaceholders = (navDIV ? BX.findChildren(container.parentNode, { className : 'reviews-navigation-box' } , true) : null);
						if (navDIV)
						{
							if (!navPlaceholders) // then add ...
							{
								container.parentNode.insertBefore(BX.create('div', {props:{className:"reviews-navigation-box reviews-navigation-top"}}), container);
								var tmpDiv = container;
								// bottom
								do {
									tmpDiv = tmpDiv.nextSibling;
								} while (tmpDiv && tmpDiv.nodeType != 1);
								var bottomPager = BX.create('div', {props:{className:"reviews-navigation-box reviews-navigation-bottom"}});
								if (tmpDiv)
									container.parentNode.insertBefore( bottomPager , tmpDiv);
								else
									container.parentNode.appendChild(bottomPager);

								navPlaceholders = BX.findChildren(container.parentNode, { className : 'reviews-navigation-box' } , true);
							}
							for (i = 0; i < navPlaceholders.length; i++)
								navPlaceholders[i].innerHTML = navDIV.innerHTML;
						}

						this.params.pageNumber = result.pageNumber;
						this.params.pageCount = result.pageCount;
					}
					if (result["messagesID"] && typeof result["messagesID"] == "object")
					{
						for (var ii = 0; ii < result["messagesID"].length; ii++)
						{
							if (result["messagesID"][ii] != id)
								this.bind(result["messagesID"][ii]);
						}
					}
				}
				else if (typeof result.message != 'undefined')
				{
					if (this.params.preorder)
						listform.appendChild(msgNode);
					else
						listform.insertBefore(msgNode, listform.firstChild);
				}
				window.fRunScripts(result.message);
				this.bind(id);
			}
		},
		bind : function(id)
		{
			var node = BX('message' + id);
			if (!!node)
			{
				this.mess['m' + id] = {
					node : node,
					author : {
						id : node.getAttribute("bx-author-id"),
						name : node.getAttribute("bx-author-name")
					}
				};

				var buttons = BX.findChildren(node, {tagName : "A", className : "reviews-button-small"}, true),
					func = BX.delegate(function() { var res = BX.proxy_context; this.act(res.getAttribute("bx-act"), id); }, this),
					func2 = BX.delegate(function(){ this.act('reply', id); }, this),
					func3 = BX.delegate(function(){ this.act('quote', id); }, this);
				if (!!buttons && buttons.length > 0)
				{
					for (var ii = 0; ii < buttons.length; ii++)
					{
						if (buttons[ii].getAttribute("bx-act") == "moderate" || buttons[ii].getAttribute("bx-act") == "del")
						{
							BX.adjust(buttons[ii],
								{
									events : { click : func },
									attrs : {
										"bx-href" : buttons[ii].getAttribute("href"),
										href : "javascript:void(0);"
									}
								}
							);
						}
						else if (!!this.form)
						{
							if (buttons[ii].getAttribute("bx-act") == "reply")
							{
								BX.bind(buttons[ii], 'click', func2);
							}
							else if (buttons[ii].getAttribute("bx-act") == "quote")
							{
								BX.bind(buttons[ii], 'mousedown', func3);
							}
						}
					}
				}
			}
		},
		act : function(act, id)
		{
			if (!id || !this.mess['m' + id]) {
				BX.DoNothing();
			}
			else if (act == 'quote') {
				var selection = window.GetSelection();
				if (document["getSelection"])
				{
					selection = selection.replace(/\r\n\r\n/gi, "_newstringhere_").replace(/\r\n/gi, " ");
					selection = selection.replace(/  /gi, "").replace(/_newstringhere_/gi, "\r\n\r\n");
				}

				if (selection === "" && id > 0 && BX('message_text_' + id, true))
				{
					var message = BX('message_text_' + id, true);
					if (typeof(message) == "object" && message)
						selection = message.innerHTML;
				}

				selection = selection.replace(/[\n|\r]*<br(\s)*(\/)*>/gi, "\n");

				// Video
				var videoWMV = function(str, p1)
				{
					var result = ' ';
					var rWmv = /showWMVPlayer.*?bx_wmv_player.*?file:[\s'"]*([^"']*).*?width:[\s'"]*([^"']*).*?height:[\s'"]*([^'"]*).*?/gi;
					var res = rWmv.exec(p1);
					if (res)
						result = "[VIDEO WIDTH="+res[2]+" HEIGHT="+res[3]+"]"+res[1]+"[/VIDEO]";
					if (result == ' ')
					{
						var rFlv = /bxPlayerOnload[\s\S]*?[\s'"]*file[\s'"]*:[\s'"]*([^"']*)[\s\S]*?[\s'"]*height[\s'"]*:[\s'"]*([^"']*)[\s\S]*?[\s'"]*width[\s'"]*:[\s'"]*([^"']*)/gi;
						res = rFlv.exec(p1);
						if (res)
							result = "[VIDEO WIDTH="+res[3]+" HEIGHT="+res[2]+"]"+res[1]+"[/VIDEO]";
					}
					return result;
				}

				selection = selection.replace(/<script[^>]*>/gi, '\001').replace(/<\/script[^>]*>/gi, '\002');
				selection = selection.replace(/\001([^\002]*)\002/gi, videoWMV)
				selection = selection.replace(/<noscript[^>]*>/gi, '\003').replace(/<\/noscript[^>]*>/gi, '\004');
				selection = selection.replace(/\003([^\004]*)\004/gi, " ");

				// Quote & Code & Table
				selection = selection.replace(/<table class\=[\"]*forum-quote[\"]*>[^<]*<thead>[^<]*<tr>[^<]*<th>([^<]+)<\/th><\/tr><\/thead>[^<]*<tbody>[^<]*<tr>[^<]*<td>/gi, "\001");
				selection = selection.replace(/<table class\=[\"]*forum-code[\"]*>[^<]*<thead>[^<]*<tr>[^<]*<th>([^<]+)<\/th><\/tr><\/thead>[^<]*<tbody>[^<]*<tr>[^<]*<td>/gi, "\002");
				selection = selection.replace(/<table class\=[\"]*data-table[\"]*>[^<]*<tbody>/gi, "\004");
				selection = selection.replace(/<\/td>[^<]*<\/tr>(<\/tbody>)*<\/table>/gi, "\003");
				selection = selection.replace(/[\r|\n]{2,}([\001|\002])/gi, "\n$1");

				var ii = 0;
				while(ii++ < 50 && (selecÿØÿà JFIF ,,  ÿÛ „ 			
ÿÂ & È" ÿÄ ñ                                     !013A"2B$#4@DPC5 	    !1AQðaq‘¡"2±ÁÑá3BR¢ ñ‚’Òâ0@br²#ÂCPc         1!0Aa Qq¡±Áá@ð‘Ñ2Pñb`â       !1AQaðq‘¡±ÑÁáñ 0ÿÚ   m˜ntá	m˜é]gp+Pp*©bFR[%°à¨Z@€œd–
ˆó·š;Ùú<}Va³ãUq #X¡¨±K=®ˆµÂW HÙ!jj–kPÓÒàf–K8;öÓÙ½waÒUÆPØ\d¶ã m¿	iqP6ß€¡Ò·œs[NÅa2”C¯*´n§ë5oƒÂkI* ÉuÛi¨Æ²Ä ôA=X„V6ÐSŒ9½(Aëiz9ãçòÞôÀS4$O,·\¦¥ÉÉÌ/HÅøB±£\u‰$`
P’F¢èÓÓÁ¬d#{¶9…']Ù­ÈsšŽ—•„¬;Z½ØsåYÍ£W(ˆé@ê¶rN¶€l’»\Ãûª±Ã6˜<Dêr›½ƒÓÍd]YL9åéXõçS¥h¹¹6§?ý€åÎ–Ar¦ìÍó£Ã¥º¸á:K”¯=R
Ò³ˆ†o×ÈE³ô²Æ_~h£MrÔ/kó7Œ¦LÀÓ]ØÀY±œ:xÁj…ã^LõÑÐxúÀP rWžq¬ŽrWQƒÎY´SÈ/Îç%5 Ë$'HÕ/&êQéïƒ™Ÿ ³5Î?¢Î$—¡©+R¦}¾‰=šk–ç:F`+¬åW_š÷7Ò›D€N¯®øtåAÏõšyÙ¾ËY3O3+iÃ´Ö•©ËÝPŸÓAÖ\²¤V,HÖÒYghD(Òæîàmç^ê¹î‘s—p¿º«¦z•Šj¸wÆ¨¼þŠØ'qÈâVZîjÓ«¶”´æ«;44y®£’éò5ú~+©ÍO\ûÎ6ž‹¥æÖß‘8½V,iAó7>æ½®Ï¤QÉ¢Êç0+p:@qQ±Èv\·W‰S¸ãµr¾‚rKÛ±¢Ê[±`kÖ•¢±–”«kc“#&H$©ÍXÑ yíÁc;£ÆYá˜«1±$™k9åë6Žo]Õ^Ð$ë‡]D¼Üö¤¶ÑÝrâ%UÖ‘ºÅ‘•Å+-32î¾T®lˆEž0q±Q­iatq¤0É=ªèg]M®$Fˆ‘Z¥-S4AG‹Y»y¬*›Ö$d©­Š1ËlË­±ÌG\I2k"²79ÂÎQ0‘B0e±.ž|„i:HBÅ¤ðÄOJ NÀ  kÚs4ÃXÞv{‚æzÆ­â «€W&ó1	Û\È'¯]qÀ×\p6qæ@Ís ƒKe1Ál®(=·ao%gÿÚ  ko~(ê"Œ1ÓhÃX£¨‰ˆBÅ…”0°¬,¨…‹ham ¬"¢€PÀ0‚°„!ÚZ¡õZ‹¡{E†ÐÇØëlu¶86ÇZXàn DòÒÕ†J¹Ëˆ1Ä˜ž îcšœÒÔXà„o(‚ÿ \>¨$(˜ö¦4˜C!ÿ XX‹¡š˜œÂøçu_R x¬÷œàSb78Ëªñ( ‘Ç“Ût“§_’oR®U­.1^ÔÓøì'A:ö»·i‡ýg¸ˆ§i.ZÇšOc³´×b/Z/UÂTæ»õ¶SkfúI±Óz›®¿¨	½ÎW:—8 ÷…Ý.u·:™‹‰EÅË4”k‹Hsp&G•,ÆçIt.{œ²=¸¸¸¹lzÑ¾Â?bW¸”ÝâãîM^äÕîm^æÕîm^æÅîm^äÕî-^âÔ?aUî!{ˆ^â¸…î^á÷—¸B½Ã]NZeû`”FŽÄwZ×wÔ3êÐËrùuœÜú—¶]J2Mq4/®aÔ"NÙ±‰õàý;dv¦8ÄÐ´êÞÑÉý«\¦[><’ým4T×TÕTÔTÔ_ˆ¿SQ[¨­ÔVê«5‘Yc×XõÖ-e]bÖF=u‹YbÔXµE‡Q=ÁÎá$2Æ™Òáâ³ëÝ†IVÌÝ¬PêÉ0—NHÛÙË†IfiI+ë¦¶~¶çI­#ØL£ÓšDt&kY§+Úu¥û~ÂÒ™dÑº=y$o#>½éd‰LÖìê¿æýv§Ë¦Ù°éëÌÇº/üÝ:öÌ°h¿^&ŸâîÞá·Nïö®æ
	™+öÌÔ”îÝ´»í²+oÑM±,Ê-™¢l{D¥ÙžPùätpìK
Ê"fÄ¬k76×lÎ÷;bg?¿Ø¥îºYä˜Ç»3Ä“lìíK£fA)ýŽÅµ#émÐéÅ°Êák®tR0e+ª×Zæ”XÏoÔÖ3;~65…®
×+\¨Q&äkžéêA
‡’‡Ë»±,OÒ9¬Z3=Ï†ydÜ5“þÃû	‘äÒØ™±ØymÁ•nHè„³ÈÝXòÑÚÛ>(§¤Ú»zÏlÇr“#4¸%Ý™Ñ’šKK·a‘¬Ý²nãRº»"Ã8Žy6òl2H6'Mß²
õÙÛlËoa›ge³6M–?Z¦žý@Ýƒ)öXöîlÇ2›m¤I6œêGD]¹;&y?àS„ÛY[ÿ X×ñ&²gý{1xØk>2Új‘ƒV˜u(øµÄt¼M1ÆØ@0ë9ý¾ºúêÕED*w'·¥-’‡ëöW¶Ì†ƒ—·¯ojšDív1ÏtlŽ^Ú71Ú`#¤Ô¢–RciákÞ»N§QÊÕ²ÚpÔ·gäc)”Ï GwT'o@»ø×}S¼›‰q'”8„\âjxHê'GÓw`IqŠw¡¨ä4ª;¶*ŒV]ß_Å)Çù<¶èÆ9Î	Ò9w15;gUØB‹®Æ×YøS‚T!zÃ"°ÔÂà±¹czÆô]Ãb1îõ_êÿ ÜÞitß+#†…»°ˆŸ¯ëÏëp‡,•J„²!r¶ReA»-Ø£$|f«u½dõ/R|²|jTÚµ†8žÐÝùo—W®ÃÜ'Œ+ñWãSñQÓøã 5Õ5øîz3}Z®é=.½´îµÂ.xžç=R[F­»Í‡7¯Ì«Çªªª©U*ª¼v?¨BÖ}¯ÞëÕyCMa(EVF¼‘‘¨±Z9DN+Ö7,o‰‘½åXPc.-òt»:íNÜŒŒò£,¤0â„V1NÜ,§nŽ_94¢ÒžÉ@kÞÂ£ê×kÈÕë[nHŸ±;f|aÎM…ŠÝpŒlFXÚ»äI¡âÂÀn×¥uÕu—ãÐaG¶¡ÁÆ!FÅ,/Gz¨v3Ÿ%sW@ª!O­UŠF¨ö[eÔUªëÂ¨*ªª•U^!v¿ÍÛÆùZ:ªê\Ëâbr±6"åÛJ»y
:ò‡6	Á X\Ž»Ö		q>R‡qx^hu_0VU\!EW&¸Ö¨ŠÖ ÐU¬FÕF â8C9q‰ÁÄT ªBº‹ãÂ¨¢Š'€|`dd…d‰9ñæ2f´!<f×ªl½j ½Ë¢ªªªªªªt€"òyêªUJ¯…HÊVªµT*…PªÔ^ÔhU¬V1XÕcUV`V`V`V+8UUUUUU\‹ÕIðbc\;BÕm®ÓcWi~ cxUWÊïÌjM‚åžjç•‰@tqåëþ7ÿÚ  {ˆ7¹drÈå‘Ë#–G,ŽY²9drÈåöËçáýŽpqðò²Ö•PªB¸+‚¸+‚¸+‚¨WñUñh¨©ÂŠœ”æª<+Æ¿àÚ­æ¢§
*p©]UªÂœ)ÍÓ‡Å\®r¹KçÏ÷Uë'Ÿ9~ê5\®UGœ¢­ä<:stäèˆyzrtUUU
ï ñ¯7EÓ‰ñÿÚ  cA…cUXXXX|còðþë<L)cq8ž±=bzÄõ‰ëÖ'¬OXž±½bz¡±e4¸+‚½ª¡^Õ{UÍW5TrÍ±ŒÒÇÔFà±•Œ„H±ôk«ÁÎ ™hr96J™|®%Ù–U•	 Y–Nh*À¬Nhp,XÅ
Ä ¬áœ!3ynëz¼"ê+Õã€ ¹«;–g,ÎQ<“N´r£—UB¨î4QQQAçÃ§p­bàWÆtãðMwÉÈ\yÛåÈU
ëÇíæAB¨]òæ	¼:®«ªø**B¨PcŠlKË¾H4”#®­(õkÐ€Mñ?ÿÚ ?¥“tù¯7t/êÍñ8»À’<Îú3yA×ÂÇÕÿ ÿÚ ?ñ;Æ]·ŸÙ©8D” ŽDr#‘ˆäG"9AdÜ,ý†Ä’M„’I#á¡û"Ššêú…Ö~\¾°‡£l?¤êôô‘5×[Š‚åKª¤mìF{†h‹ƒÐJU|¡o#!™°\ˆ’c­¸û›QŠP¨™@™T\ë±rW¡æ¶&]l& ÇEÙ†M’|—I&Îî'G}8><ÇùÙ¬m÷2I72cèvC²ì×2I$Ÿ+¬xcíì/Vé¥nõèÐ’|úW·ÏÿÚ ?®“s5ž*ž*¸s* ^^hñUòóUq,Þk˜É¥æ©â<9¼Õ<G„¼¼ÑŒKËÍUÄx³yæ\ÆM/5OáÍæ‡‹ËÍ9——š«‹›7šç÷ZJž>\ÅŽEäU\|ÅäU\|ÂâŸºÒ*ž>\ÅSÇÊ^E~/1Ú«ÐS	§X¬Ô$;++/udd…VàA1NÉ‚’abr€¸‚â‚Œ@&(é§°*´aÅ""n«kïG+Uõ ¨Zk¡¡N…™Ù‘Ðè‚aVV®)"EêŒ®ToTÜ©ÃÈŠ«HìGAìL&ªª½ê¢«tÂ~hÒÑB«„¾õÓ!×N•N„öMÑÐŽµR‹²´míTår{L”•1­V®Å¨ö(&%3Á3À¦•Xê²ÂäÏ“ÊIÉr£Ï–”â	ÁŠq4ÄÁpUÄê(L–+S™£«°#SJ’[RôFÒ›èï)‡B:O‚ô~o%èüÇÁz?1^ÌW£óèüÞKÑù¼—¥óy/Kæý«Óù¿jaÒ'ñ~Õéïý«ÓßûW§¿ö¯Oí^™ÛûW!ÛûW%[Gé\•í’½£Á{Àªÿ ²®ÅQ1zHm7æU’#Uxƒ‹“?íÄŠ-KRDCN59±88½ÒO‡I­fcñ=|Ne$x}÷•Žœ.0ÉcnºÖ`pÊl« 6#wö±+á÷Ÿcà†ê'üï’é8”á˜ÄŸ}ëbƒbêUU<”k3Û ªú”¸&²/¢ÅC€0‡.33ˆšø†h*›	ÅQfŸ¸Gö³Ô3É0FóÂ"àáÂØ‘D8 äß„‡9±±7Ùr¯âxO7.nhN’UÔÐ¶u
FRf„AÁ²á„ÏSTÆB/0«” ÀÏŠZ°\åS.^§{„*¼ýG<>ê)#äðÂÞè¢øâTbÅÄÉÌ46I\°”žÖx³É~Ä)80!z_1^ÌW£óŸè|çÁz?9ð^Î| 9ð^‰üþKÒ?ŸÉzgó~ÕéÕù¿jä«ó~ÕËWæ¥J­£ô©W´~•*¶Ò¥VÑúW¿´~•*öÒ½ý£ô¯û6ÿ fïÿ fäãFÈl#íã¥=¸Êÿ åÆ•F ó}×ª:]3ÇÝilç½b…4x¬`Šé¾•õ„DÚÕˆ@gXé!ˆA}haÈ!MðC§:ªfS§Âè´0Àº5aù,P¤XöýètˆjŒ¾õfÕô™ªÎL}èÕL©›íû#J£g%×ÕŒýT¡‚"5ñy®¡®Ç³Åtj"[ªèéŽ› v»fóUþ%Õ×Ø©Æ1SpÓÑëtÞ—ªžŸ±úa†åýX‹èðÂÊ–Ÿå¡R÷Ò¨ú¢£M˜e¯þ:Ùt0SWMŠ­zIxaû»WJö«Ë½WAÅõ-6Y-L¿ôQsÅbc†ÿ °ö¡Œ»Ia °\žË6&®¨\!¶ô:Dð<ÑúežkèƒÀf–O±
i!†eMUTøb.ÒÈu	â"M{¯ñ4|7,F5;¹O^ízoXaP³AtñÈR%â°Ò€Ÿ‘ë*å  )ÛÄª©qÌœ‚§§W5\£7Ävv}‡¦‚Eà,-“ÕIBqAŽeeƒÞIªsû1a°Í³ÞœòS?F
@s`Ì¢H©Û”`…T¸6'¬’sä>Ý™‡O§Àß¸X më©Ö¯ž-Š¡Öÿ ÑORš¬ðÌO*): "°ÔaI©·ŽåW[©:ŽŸfÓ¸:Õì¦‰8¨æèÃâ=ßÝU·ÒþåO¥žz¼HÓ1à¨êj™õÎêƒM=^¤qÕœ÷XC«Ô¢ºé5¦sMtð³›ôX‡X†¨xá>Jœ$y®‡LÞÇbôNŽ˜÷NP‚?G	ÄöY'BŠ@â¤øB^Ç}n–"-4*«¦†¢¯s¾uŠž{ÃcžÅUuÅvÛQê‘¨¶—Õj£¨G§´ÜæZuõ)àÌÙžÙì:i8ÀlVi¾	ÌmñÖ©jHÂ^>J–¥°¼õi¹P)a¿¹QÒ â¥´C+—ÑëSŠŒÛ{QúTYªÌún]?ª	6…OK§N7îmq$ÍSàó]/¦øºwìXºMy£â‡Ò§"ùœç¹Rh°%M8[¯ªáÿ ÁR	™céB ²·ø5}nVïÕ¹C!†Áž½ìîšG1†gkqÍõ¯R. úHâ@ýL¡ò×î”j¦¾7å}ºZ1O‹ùs^éŽkÄÀÎMFÄûc«},FöÍ~dxØ9´g†faðCýºwø£kBÛìöÏÙ†šuÅr•È¬S
5nû”ÎÅjc¤OS–æÌÀ>’¸ãÒyŽÝáMvmœZÉ6”xå›HŒ`@çŠ-\žËœ4óAsŒž5F†w–BœNöîÎ…±Õ-¨­}$ZÆ-þº¦K>Ö2ˆ_3(UcÉ®•ð«lâòž~)fÏì ³©âäaìÀeQcÜBš„uø+²Î£Ô¤kÔ£Ø§QÐ>åËVïßNyü»Ó\>Ã™Ÿ±›ÙaâœäÐÚ3RÝªŸêTÿ pTý2C‚ìu©ÔM–“¶%´¨¶Wsy¦³FÛ—¼ 6lŸÙ@ÎµãÓ*4…@?_ñN gûÔá•Ô×jPmßHMõ¶Gº®ÕŠ¬U˜÷¸zPÙØê*¯kË”­ÏË–R½r¬8crå\»—)Ø¹NÄÔ‡9½„SÊ@#-.¶.Y×Oñÿ Ä§Î<We•Tˆ÷¯õûÖû{$UP‰„FÞ+5J
œ2ªÅNWªôû];¼_þ]¶.c–Z“¾Y*Æ#å>ácX¹ß.ÒŠp ÉsˆÃ+âK%Î+[îQªn³vD…ŠˆgN¬Í²>>Áµt¿bíY²UßÄÏ¥wÇÂõô„i|öµÿ iTÒ=Ü›ÙQûØ-žZÖ¡ç®û&ÑVƒ—sÍ{Ú<ö(ùwwÚ ùnÈ©ÔÂC)^­ËV™ëe3–©I­›·¶“u]¯åì—Hç?âTHžîQ­ôw}ÈÕDÅGµqtÍ6±–Ú™50þ£Ê)Ä•ž©°ó.uRê"Ÿþ@"Uÿ Åêe&öEPÅ£ÜUú)=§‚Žú€ÿ ¨TkØýæ‘¹L“¨ÌW(ÒcþDº„hv.oà8¦,·&Â¹r—lW*jCû+±Ðk‚»W8ÕñP¦ª·yî\=*iÎr
=_ËåéÉ5ÿ f’k²éÏKCJçtëÍ”×8œü"ïlZãXÑ¿}‹‡ª.ÄGÔ€·NZÓý\Åû&cšÛÓž£›wdt#Pêb{¶wlOAoc
[)_ízƒ0HWôj0nþõ*iW]ÝŒ¹1­(–Ó:áˆ6|¥ö8ùn“1Ëñv2ˆ«)¼v7Š‘9F6l+Þ|³ýÚ3fâÒ©g—ÜþV+råóöÆV&Pø†xfìMGMó˜y¡GÐœªg/eþÉeÚšÜµ¨ó]¿!<ÉŠ„—	uƒ«Iþ1_Tb4ÌoWhñ)©•Ú#¬é.žwœ®4ÎâŽƒîÚÆX*<Âµgb˜5ü[ËÞ£¨XX€¬a±Ä¶NœÔ†âayîŒ/kÔ%8Ÿ·‡,™42qÜPh¼B´OtÔ2³yLÙöObÁ#·'’„Eþ
[‘Ùì¿±;À@öÆÔ[#l{ª+îØôø§EN\‚¸uvËSƒKc¦ò¡hÛfËUVa{g‡	…fz.: +€~*»‡ŠsyûSË"›¦“¡z‡ öçáÍ2¡Õß·wjõ‘ã…0-¶G4/‚õ2³Æé ýWË´çDýhÇîÖÚìP-ìïZ™<Ž«þð¾ ‹•WÃSç!m2v4j@Àˆ.(ÂÂt½ØO)1b&ŸÓüv¥¬~*»©ñNbo9Cø4ð>|÷l\–û²Ó^šaCòÈ#œ¶GfÄ íe™ÈµêÉà‹Ñûl9wû\@¡O^c—¨'¯-(b­Èøft‘Ã6eÀ0o>Ry›ÏòÑìóPìSÜ§¹Orššæ\ÛŠçÜW>åÎ6Î7ø.q¿ÁsÓ¿ô®zwþ•ÏNÿ Ò¹éßúW0ßúW=;ÿ Jæ§é\Ôå©sS·ù:nÁ &æSœŠâ<#n±*÷×1aÆÍùi{Î…ê;L§)*¸áIÃ+g©>)3¸¾ÊM¤[ü£{¯îœõ8y:ÃHjrü4þ¬§Ä\ÏT¶.kqk½3çñOQç?ÿÚ ?!5”r»qÀkuÖf;xûÏl@Ð¨CôDüJàô§¿ó¸ñ9Žþ?¥ÈÕ¬šsÎÍ¿¤Çã’ÔmKcÚÝ*ä×çî…ü©
(Ä$¸¨ôWð˜_J½¸Šw½ë·¯x êÞàºÅ ô«õ3aòÌYWõ ¿bâr*¯²YÆÈòŽAgk¼¹é×Û˜+©©qø÷€‡S^º†‹×õ×¬àñçëWq™éþ­b™s~ÚÜ&º¬z+¸Vƒž¹ä5ŸncàÒëOœÏã8¿‹ŽSoÇó<ö"+v1éÍsQêfÕã÷*p_§÷)©–MBDô5µ®?­GP¤â?%¢ÌpúD±=|æåcW­çO¥ŒæpjýM¶ã<7òÒ}¯á} üÌ“DlNk.•O¬
¿>òè›põfG¡?_qÃ¿‚¯N·˜]ÏÙWòÆ oŸ“,Ýê{j;êžÑfí.}î1³~Øþ#ÙuV½ûUTüOÄ^K„^çäJ~]Â²{»_Hœßâ2òïoc¬_‘:ö.åhÛuŽ£é¢9úÞ¬‡æ7êÛò¸Ì#Åç´]Íxë³}¿¬£þý°{š|©ù¨ê6òqwŠƒCŠ|UýÏ9Þ~oæTk[ÍÔÒÛ¾UìCg¦þ™÷†£U,
bÚÀzBà'žû¶Ï¨~	öÒ/?ª!j“’Ä:ÚtþŠ¸*üq
6[#§úL—³ß¡.­ýOó×ñÌHEÐ?ö€š.Çãgæ'ê:[V¼Ó;'ïérÈÛ^l˜DêÇ;ù‹š–ß¾ð{JÞ?S)šÎ}}&îjú¥î»LÎýo|KIÇZö¢0µ¯óDq™[¥ÖØ±»ÉYxN®Z¨ƒcfÏ—,ûQî»NÃåàÓÈýSÎý^y.|§j–úƒ–í¿÷}|øS:é—VîØ§wt¯Þžr‰oÍ÷|ÀÐ+ï‘\—ra»J­œ#J!¡}Az#LÍŒyCD*KQ}D¡
)tçøê°F
6”Ab£ùv¨ÒªÄ³Óê–+î…Ð”.ÿ j„Øûv…WK0ÅPeõ¾èI ó¶øi-XKJÓ4ÖLÑNŒ À´ÂÀªþ‰Sê„ – Z¿ÈR‰ZŠd€Ê1²RÎûhÖ®c½$‹ä£Rû®´h6Ë3…Kt{[«¡Ù¥Ø¯u²RîksAœQˆ*£o•P±¥Úˆ@Ï'¾±½ˆXál´ÿ e1ÝŽGDOõ¢î`î õà®¯Cþ¢_î“Å)‰#?B|éùñýªÏ§Iõ—EŸfXþ±;·-ÿ T»‘vP .L[CÀ-£n ¢ÇKþ˜ååÎ¾,_´Éâoþxzþ¼sñä–Þþsï/—q|_ùú¯É
ïW‚Û·ŽâèsžÙphÃUŸ^'ZÃÁÝíÜ˜4S†ðçÆØíÁhyu¯IR2Ó7Æ8#6®øÏH½œs—Û¸Ãmƒß¯Ÿšê˜±|Ÿ¯â`¡:7¾YŠ®Ã/Â6jÎ²Ò÷n|‰îtb¥çOCIÜ_+²ì©A\õ“ ôeOuÊãøÏÕ~IyéÀn‚„G
¸äé·âPÃ.Ã:Ímì„·œK«Ç/yžD¶Dîtˆ¬´­¨è ¾aRÄ%{yîãÖ6ßî}
ç¼ïwcÖ8oñ³uÆWÞ	¶mÞnöã°¶û¶»hJt={g¼Ô.óaªØ. ènàÁb‚¡w›­3Ù4}W§ð¶· î[í­Ìô	Uäµ\>úex– Á³ü” V÷­ê(7I}¹Ô¼ÂÚ›u4=¦GÏL8tÔÒ™ÇË™@9«­ëqXYÎóÄ'V¨—²ÛÖÇ@‡¾ï¼Î	¢‚Æpm®³žÕvŽ0ð7›c±woL@²‚•Œ³›F%uî+Z¸‚øha/”ú±H!
¸»ºv*_rŽÆ¨(-æ!	¼ý£îMÞ<ÕÍ‹‡&îQn®‚‘q~_]<{š`Ÿ!±qÃ>•¹DT>Ø‰Š €]Ï-Ñ™+j­ßÛ2ä:B¾Ÿw¢øwMÜêôùb_Îºd1—3ctY^»Ÿç3üçõj7òøÜR‚º8”@;WàJq4¤sµp ~'"t¼~fÀH1aŽ¿¹K+¬©¬–?¯xâ‚PÚõèRv*¨­×K©‚;J¢¿£¬O`Úr°¶L…h=Ãx¤c°ÃÔ,z_àÇ¼§lŸz15( ¸ÛÜ’yÑ¸°{øzBs™:œ±£uXÂérE€,Ç±õ!(me¬zœá.¶ÂÌº”0¢ß€u6ˆQ3æ«^Bðš;e^µ)dKÆ½NÎÁ”eºKU`þÉJ}Å3êù˜A-Icö0C·«lsiTUŠc@¥7uÌI%¸ûÐ®ÒØ×{ØÁ¨•CWš7Ãº* £Šú¿²gè‹Í—†Òëhab!*£Ùvì¨aK]ž^RõJ~O4ÏYmïµ@×žðS4ƒm:ŠñÒmˆ+Z)¤n;ØèLk"˜fÚ}£št@J¶ãî.ÌG¬y5-@€#ÜT­ÕV[ÔÛÀ*1ƒ—6âTŠQ•qx9Ô¶;ØÛUÑUIuTãesxö–ýq\týŸ÷L_Xê½Ïž#¿_yxáƒå—ø:ÿ ÙW~$®’¼ÿ (;ÿ ©^=oŠZó~ 
sÝýÎ§ÒÖ5—v”ÿ Åªk¯'¯-fZÒ4(ÈÜBÔÚn»ûf6hTiBè±ÄâÚ±O]8Ê ^ØÒ…f™•½,¯•pEbV–Frˆ`0UÛfÐÖ¯
z*Ž’9¢aHÏ
Ç_{~HêòzïwÊ/W¯ã·H—¯Ìõ¾e,Ôá	}n]á„Ù‡tü]Åp=_éœ‰ü¿ÄÐdþ`êö¿e”só	³öPäþ3*\º¬ ³p	vU€Å©F¢¸Ê½Å­Mõ¹Ëx–‚  W†R`÷»¼»5ªM‘‡£Y²ƒWÎbâ–ÊíhÈ0ìÓE¡FKO„c@4ÃÈrärnYvàf.ÏWŠ¾¶½Û‹R¼,b½’ []fûz'Y|‡î¢þÝøEÒ=ßÚ}~èÅYè~Å%¬zƒù‡‰þ˜°Š
­þ%cÚŸåño“$Dö–½Ü¬ÄÄ1¯-úC·Ì²ÒŸ {ëö«Aí@Å]Q;¯Ïž„µ›¢æ/QNvïœÅKÔý~Öy›ìâ ôi03}É°´ZÙ Y¥Äcbl·Zw„&Án}Y4q
n½ú%I 6ïž¿”ƒÒz ü“%ÿ ¾ç¤%xWYŸ>q*¥u_q÷Wð¬uüµÞËû@ ?F{ÓJc5RzŽ×Ò-ù“ä,R:¥lwça­eàÖAB~çé_QŽï[×¸ýEƒÂ} ýø¨®u°Ñ¼0‡+„_*ôúõrC¨þ/§N‹¨_²¹iž·ƒ\ÎäxÆçYß«õ.m.+×¬äÄeËôÖâö7P·êu˜®	»Æœ¼RX.ùlê'¤Ó¸ä=Ô_´°ª¤õç¥¬ËðŠ_`Y@CaÆä¼œA„[°áJçÒY{_ä†ýïÂþ#¿Sù¯Ž†ëÓ¯h1vru½¹MàÉ¿Í.1z‹hbápt^6¡YkR‡¦
TB‹hª…(.¯9Ï°°óžsÎk‘4Dh3wœ^ËÕ}·-Aä:(0Úñ†i`=*)UÍõó™Þ«o°_Ê¥×Í»de|ï=ûE½95]«eÌµ£VfóÂc¯	•dpucœq¥¥ã\*º’*û²•wr9T45Ëyú¨¾À¼4z?Ïî ›m{ôðâ¥o!ÁŠ*Á/.cDÂúŸƒÂ%N¥ç©T©gøoÔÆÆ_oKx£8WôF½;ÁÏ5m|¥ÓæLvR­±…Ž.ñÅîÀ] êYXÞé£:YY•˜'õ‡n`UúŸÔ¿©ý;Æ‚›õà"8§ôÆÏ°*vT`‹Å¸>\Þ¡ÖÕ€Ë÷†*«œ:}nË—Y [·Õ·ñ-Ê°V½búÅû`ü¿pöx[çî]?2ÕçøÉÉqU¹i~hØ_ÉK.`4cÜÍ×½Þj/•³Ú“#Uæ¿O¼* ®M¸`mæð¼9îw‘{¿ AEz&m…õ¿ÅÎ·Ÿ¨ô<û’“Z<ÿ ¾ÚóÒÄèg[¼FK+Î=)Jâ†õ(Ë‡8ïü\°4´öå½Uó–ÆõÛŽ1_Uã¡çŸxOiüwüMÍ}Ýo£™°v[ë[ôŠÉŠÍô©D5òÛ£¸«SÕù¼žçX©Ò{—hÙ–ßæÏøxyòA÷ÆZ£¡”m§1|.Üô[ˆÅy‡F8Ü‚aõXu ­SfÅ%ª6z¸]fv=ÏN˜}@Ü Ïí:ð'jøq4q}Ýî8D6o+8Å»Ã„4E:;ÝËeCkÑÃôÄ©oÈŸä?ÄÃý/UU!¶ÃÀôÎÔü¥=|ÃøˆC2zƒâ °=+ùÅ÷>!ö=-¾zgRÖãVëø€µGÔz8¸óòD/Ã¯ Ï.f2¹sØÉ‹ö}%Ï­Ýž—=ÃQE–
ªwÍ»9®°bÎspX ï9¯NÒÊ+ª»»·Ju€Î²Í~ÖtáY(émÕ–`ƒÐ¸õ•Üuîáy û¯z˜TG–Ž«,"ˆQ{ýVí¨Yýªµ+R)èauš`4¢ÎE¥ìÙíÉ÷^÷é«ƒêÌzOƒ¤x#ÑX#zÄÞ_ö¬µîw%«Á¿Xe»z¯hë[<im=R˜b¼dóÜæ ¯&–è	š‚ µÚ u)Z‰.]³‹–t<RéK,ÒÝA¶!93kìÁî*Ø–]ëc¼g`p\"¬ØáËÞjS—HòÑç´I¶þ¿Ùfo5öÛå2kxÞFF  ð|W¼¢
,p©.±ø–€n¶uI]F‰zÂÛšÛðÌLs»®U¦lãfø2íÈuÎßhˆ´¢ï'ì2n–Þ==ß
 ãÓÙÄ@ Š81zn¢eµ™àwv¶~j6 z:vÒvK<qËeYAE”Ã%n›-6FB†—b#„$5qÍF¯¾4Ï6u2?<zbÇYÆ<ûG¬ë¶*Ÿ04Éª>\ ­aŸÔ…ìhuêºUê;§'_ñwrÚ²ì½V!3ŽŒ)ÆP9ÏOD”YþnªîÅÌZZ±‚åâÙà>f²qcXéË;£¶›õ…>®:× ŠT”(ÇàX«	[¡	6X©BÜÉ„VGçŸ{ÝTösëÕ¾\Ý·ÎQ¯d¹q…Ÿ$d#rå£fKÕÏ¬¡€àg¾Ò»²`äqué¬°îýëÛîê0Àk/{®ðÔ48`9k9u‹RªqÑ‹¸\’¬¿¡gjïŸð$‘Ù‹˜Ô«º¯QL‹€×ð¼Ý’ƒkåÈü¿ðÙe?ää/±çUƒÏ>.Ùlc‰oV[«2NçŸ,µîeð³zùúÄz§¬Ó£µ?™æÿ iæÿ oòÈÿ Ž%ýß}N‡úNÛåúð¡ÃõÏü¹ÿ •/DðÓ<S}/ô¡_î‘<é+1ÃÄ·…¬AÚ/?Ôvÿ ÆØ”Šl•BØF“+\6ÝT˜]œÅ¨%ÌÑky±èe/FêVeÉ(,(ëcÅ /JˆïÎýü)à¹qŸà‹ãÿ Ë[š~V§Ð*•Â TÊ_`¯d†f‘üiñFØþ;Ÿ5*¼VØ­¦Í±ãŸÑ£Ú[áŸöyóï3çûŽ=¿ï÷åœgÛÏIÌÇüuŸÿÚ ?!8*ÁÓùôÿ £õ< ýNïÑ;¿Gêw~‰Ýú'sèÏ¢w>‰Üú'sèóÌ·½—½M>çÿ UÆŠ¬ã>YR¥J•áR™™L©ñ![Unª S;ó½;Ó¹;“¹;“¹ùÉÞÙ{ñ~««õ]e’Éd¹d²\³þu:“¢ñwßÎ&½ýëq>ÛüOW^¼ýBœñ^q¨EJÇ¥õç´¯ÅW©=]>·3çóáÍK~7¿©n{y¨YöóS‡¬Íï«ë;ÿ ÿ 5çüúfy{Kûþ1ã^ÉG›”|Ê=8Ç¢wó™çæTMvýOãùÜ£ÏÏ¥¿æ±~@·Áo¹êðynOÃb™}¥%'?Ä¾ÓÑáW÷úƒ§xçRüÚYúÔ—«‹‹ñüxç¤ÏIíãYzQqÓÁ¬Ùæ¦ÿ <xWz™ÿ ^‡Ï>>Ò½Ì§mô+óq<-•y”ŒÄöžßRûW†ÒõÕbfµÅýÊ%Dð	Ò{>gÇË/Í±Ùþÿ Ð|ñv•u¹OIOIž’˜×ó^&³¾æ;}Ï-ÎO9ž«””èôÖ<7ðhÿ ¡W™s}1N<=Óçÿ OÿÚ ?!ÈÌíÎÄìÎÌìÎÏæv3³;3³;2Œxºû›}ôýpÕï£%8íÒ\¹råÿ ÍË™=ÖýE]êXÆ*·\³ÎOÜòÚyí<çöžsûO1ý§žþÓÈiä'îyµûžM~ç¬jï‡€Â‚Ø8¬gîg²ú\ç¥=˜›Tƒ]7£Ú¥ Ó:ˆa˜Y¿mÁ´1—Ó¬Å—«ŒëÅ±‹raOf{šŠ«	ßî:ÂÔt×9âëo9.½S!‘TS'žš€f\yÖ÷S+à)]‘‹ 89ŠëÛ3LÅ(äMt*6Cm4×…±œ‘(têç¥#bS?cýJ:lÏf¯Òêü:X%üÂÔ2*¯^ªæ^•Õåð™ÐY[Œë=IÉCŠt­îiÔ÷¢Žn]Ù:Á“éRñ6¶&“	ï;Ã…Gy‘s³éûY(ÓëËPAltÇh‡K^ŸP</:jÞÎ50™ËÕê¹2®GS¤œ¨Þi³× ¢*%^xÖ /5o¾y\©Ý}D!’ùj¾Ÿùx¯œ£Úk£P…ûtîÄŸZÃ‹ÇÌõ¾pÝaÎŒW¤·ƒÚ×ð |þãÕcù–‚UÖÊç·H«:%WNãÃ=§¡sÈ©ËuYë1uõõ»ÔòBf¢u_¥‡ñIN“6£ù<6‡®%ô&:“ÜVc~ÿ qþQñ»éüø"òÞõú‘è}|ó+ú@Æ›;/ïÃ‹ÝzéßÖ3=#™¯	y¿\ýÁ¹™åž<˜˜]MçÃG§üŸ{ —þIž›2‘çÛVP0§Œk¡¿þ.§µýÎ;/™Ø|ùé/£ó)gCyÇ¿þ5cWé^¼ÆÕëÇ¾%wß–à7µƒÛ‘ëà'DíNÔíMe¿ ?š…`	ìËõøRý~Ôùøeúü2ý~ü?7†¸ÇW÷	¿Òüdrøõ¯Yixyôw™åÔ‘ñá¯soçwíÅÿ éÿÚ   š8gšòd¹å%$±#j&øK•Äý×‰}P±œ ™LÑ'nŠÿ \ˆó’UÖ€{hö}\vöBI@&ª¥ ÛŒö°ßxÑÆB8þl(B’ŸªÄWÅ’Mÿ ÀQÕÍ6boÏô'ª¦˜#‡q‚)Ä¾3¼›²oy¬chækÂÖìs'8,-'¤(cúoLÀ±§ IÎ‚n±Ž¤ëp<*g8E"‰25¼maûv@¢Tã²ÛóÏÿ <Ï?ÿÚ ?^& ^@Ø›l` „¸f»çå  v¸ƒ·ÞNmÓ»ƒWèBt4àR«!†RƒžÛ¯Œ¥&ÞˆpR‹8r€|2fXÔË'ˆ:úõä`Uª9¼@Ÿ˜ñl˜ôKÞS@äŠœí&b
(Šëî‡bTÞ*e•A‡›[1½[¯.ä¸½‰Ù‡tÇüziŠ’®ô°ÀÐµ€Þæ4–N<¢dZðl@ wìUy`0´Ø»¿Î‚£d¦ÚD]Œ$ÚÝ× L¦»Zk TÐ)DFm¯AH æl²M<=2šÂÅØkˆû€ŒÙJ×A½ÊŸÓüÌûÖaT6Z·\u›ÓÚ’º÷A¨Ö×UÑê‰F…viÔ©H]öªéë.Ÿº07Ý)‹ieÖ9†ˆè 8bd­,%7ï
ì$(~áp)¹vÍ r€´ì;Gû¢ËÔ5n×›àøïphÒªW#1ÃS ï…b UXÊ@Ê7·B* . nŒ"Šƒ—®«xGlY–6ëh”or2ëq.6©W­Eò=ª°bÿ ”*¼«Å#"•ºk_·GOi‚æêëkº:T’µ–µƒ¦ÈyéVQFÖù%Ž%u ¹@î (³•EØ„ASÔDh®U“Ê¦qRêE”Ñ)‚0R‚(gGLÙ–„kØ¤£n=ÕAu¨dUcq«€Œ!íý¦7ú¸ã.Ã:ÄËÍf`XY£Lº¡Æ¬·Ãð”ç¥F­PÞ Ÿ.\2H¦µÎÆ¼Á2ìÁ‚‚Ù³eú°œ©±\Õh1GÞn˜-Ë‚T²‚7í	ý¥µ¤6
zºÃ•ÉÊ*6Y¤$¿w¦«ÞŒRèßÙ(¡ã´ªz¡Ht¶i“4=ÙÛh9;ø­m´[hÂË	)eÙ §QzÑn(Î‰¡êºEVWZ1ª4ÆìéZe•R¡F:ì?ŒŒ1UY†`tm/Fà
Fd¦G‚¦Jq±4f‚´I€àÁ@^.§:ÏnÇ§ìŽÌô‹uý}íúÍ€½i®jˆí»g¬8¤ì“]¡Eê1éHrfˆÀR.°qñ	¸W§¬òQÚî•øOÒk6²†Ž¶²Ä‚…Ã a%wGî™-ª-NR'ZI'‰1*,ÉV è»ˆÜ²&Ò¥7éü°B¢Ê˜åºÊ¬Œ„oÍ‰	§EÛði
5)e
}G3re˜h@Íò“ eD§É®aOLþ†ã,ŽfÝ-4y÷ ÐæbrŠb^„±Œ&õá¨L%Û7
Lt‘íÄ–ÑnVNÜÙ—j+\ðH

fèý¬(åž ¦sÛÚþaÈ¾^Œ9ü$µ5Ç÷MÃÇ ­BZÕ]â±FNDœt1-§ñ
â˜7RŽ þS¢ ç/ùýeú3kÅ“­,O4æê:îÌžñYÎëAÖ_oä1ÛW»=W½a¹ ²ªÿ YDMRß 2´ r¸"D°ÊUÁòUU›$íÉ‘æ2éÏß…åœwâehçöYwrÚ2–¯ˆ·¤Ïh#xf Õw´´}E°qï,¶‘[sq»+®&Z·ÒïD§:¼Îº—Šñ°¢âÃ€	=Ê…ˆ®@êÂ¥—-	Vi×X¥„KI`}²I¤”vË(nEëQiYT×Òªö]´•¬×—…LæØƒo,ãà¡!¶)6 ,è³C(Š¦¥TâAU ä¾„­¨7S}€ó.™¥Ç¿‡1'µˆsï Z¢ëbì™, ;
‘2r0ôz¢ÊÄêÙRO­qdXD&H¢¤Q3Ú13Â«‡q2+_D`Nlhf6üfá~¬l’îÊ&× ‚Å*©'Z 6’¨å‡˜©j°…\³bè…ïó@€«G¥Šã*7°.Ò±UÕ¢KjµyÍMk´'"}%™­"[„Ðç_…7=Z¸a!q
‚{<ŽMK”rÌ!((*œ½¡×a
ÅìI·&"õ’[PV¬‰ÑarÒ>jd,ŸFi]e1£€Á4kI@#Ó@…ª-ÎrÏ¨P¡$aVÓÃíh9Ñ`•þ™Š¬ßØÄ+­o¡Fº7Š;0žÄ »¤+‡|¨¿£Æð¸DtˆKfaAUPìm`@+Q	¯â§˜$ ÈQä¢ØM'TBz¡AY  ¬ÏÞUª ä×ÉÒ.®î’,I¹Ø¾=Ó©:éTömn¹ˆž±Ñ£0ñzém"]æ¬BYªvETÓ«ÚZÒÂuŠUéüÁ®ÈufØ6â"JH5f8€—‰Ö›L’´F”ÓHÆ}@ªá†Ð\e%‚WšÃo#/64ñº2ó@=Dz¬·d)ÑŽ7Àæ›[¹(Kå+—¶À‰¨úA
³3PQ¢"g>bâe½ ‹¿(…Ø=5œ…*äJ2"”2â²¨ÝUU)Ô¨íU˜ ¨”ÙÓQØ”EV¯M²{~($$¬°Ðª®ˆbµW˜dô&€Ú Ú'â¶ØÊiÄÚ€5ÊDZ&ƒÑÔ¥xeòd¨Ð
ÛE–k¼ÑTK
ù’«µ²bàÊÔ79ƒ‰ +,‚‰Ô½{ˆØŽ`¦lC@¦VxÉrGØ«@$³R19êA·¢-I	átZª2RL*ï4°øl{‰”¨Uå=ç3OóÂÅÕvî=µàÆÔò‘x5¯“Ã·O²Æ®­Ä
Ê{
wašiÐ­öœw¹—íóŸ$É§î4«vÿ >&!ÿ áÓÃŠxã¿€.ôés%üblZ¹Žªæ!S^®%­¼ßá	)fºˆ±Ó¯´â =Fé‚¾£Cù”éN,?hÈ»)lØ41·ÂLx'Ž="ÛôˆDJ4g;ê&†`ÁiàÌ,¬¯4^ôD ‰IÌÔª  Èœa„‘5˜®Ê58t` x„}
)	c;õœÏ z\:Q½•ëQšfïŠ;1¬±«Â	^‘[¿¥€9º‡ÎÝdˆ´b…A·Ò`¹ÚyXõíOE*P×æô)æé€-«Ñi2õÀ"©m@ß±îÂRb†úÖ"”†#XŒ‰X+Èxœì\L…—pl|…qr*’–‰TåšEgQ’e´Õ¹D°k@¹q» òä ðc5ÜØ¾ñ±³.¬·´À¥†¦Ä0ª¿XÕ,Â†ªä)¨u±§w_x3jŽ8#iÀ³0v6û„M KV™Ó—{°ZŽ3i§™Ô¥±GÝx&;fã‹5p@i,¬‰Ì»G8µHË·F	@±ÍÐn=,ÏcQ
.ï›z!VEféÄ5;*JÎrcÅ·T£n¼jÜsu
ªÛX@¼2¡M5ŒYDÊáÞ3Öcß¬@8V-É²3:ö8Í!àä‘@µASJD"Mé”%Hœ–ˆ´Aà]úD[I'³Ú%þJ(Þîk~ÑôKõ§»¤…võöƒ=¯#1^§Lþ Ut¹@ÛŒsh/†Xáªâtä×ÌH„C:7˜!Í9ëR—"…Ÿ¸BQºjLàAVY@Th˜<,ÌÈn*ËaZ¸T¾v*h[QiœÎÁO]ê¯’@Y`ÃNLÿ 0ZN¾²ÜD¥\ekYÔY™mÔ…ŠÓ#ê„sQ¥Ÿl,Ð +$ÁH]…-¯&BÔP:“AhPP u\5rFÂ€ÌVŽë^ðq°Ä„@KZàü0FðÎ¦Uþ!! YC
LV*ã„ø% HP"'4ê™ðÁ WV’7q—©
Àtk¥(+Ò¹š-ôÌ¡BâÌ®	-*–”á¢;Ê.ª*—… œÌ@(¼Gª¥FDJ®˜Q¼€T† ×‚í\€C1Wi:ÄçžŸ¥Yh^”‹«ä»*å‚ÂmÓµ`¢%K™æ¡–ó9„R[s\%K`M XÂ@j-RµÚND.ª–ƒ¸¹bø8‘‡†i£J
…­‡9$ÂÉu›Êt£•Cy}X¦Øö¢qe»¦.„«‘j2œ°‚°7Y@ ŽÂØ{Ä<D%&Ëâq%›æ6"Ä)°ä£$¬—ösnPm«›Lªþc{yÜµÅE…Ñ°ßŽ/ý„Ó?FS/ƒlvC<DÏ@QU¥¹á è­ÆêŸ{ª‰bÙCK‚è†ABšÀ…ÂŠG”í.lŽ)^ôaµ|»ÔcÖåUI½c˜ÜÊ>®û‚[7Yé,ˆ›Ýíö‚ÓaPëžÄ èåÓ&R½.]ÙN–³_0MóÇH^H+˜b¦‹G}¡YPâêˆÔM–šo†´u‚úÀk{åHÞ°êŒíû Í 5] Ü•³
“ÕÀ³*HŠ[a¦,ÝnïœÅëF8ÄÂôéÍˆã9)o¬ s²íÜ
¹u5©q+¯ÐNuÛ
ù@ªÛÕe ih7­Ä¹#H
 º/Ô(YÁe©4Ác¦´ëˆl¶ƒKÛ?˜pÞˆÄ"YûJ VÕ¾ï¨€Ý½^ËU²QVŒ€’*µÌ›Šf )º•R)®=Ž¶¸¬_IÚ/±)k'Ì«9ïþ°1+ÂYâ‘	Ms	‡9¾Ø¥“KcKP(	êx’êbúbÔ¶Â¸	ºÌ£3¼°k™¨Gê.\ÀªRd@d¬"VýÈ(‡4—Ðº‰ecœšë„¸ªÈj`¡ÈÅ¸az	®by0äÛÓ*=)–ê½f ×aÜ–‘Ir‹¤»¨;XŒ =fŸ˜‡«ëýExòYlrÀ8¨e0ÎžÂ+–ÍkHµ•pÛU‰†
°H}ßZ(WFƒü©EÐjK¨JßvQorµ¡¤„p0“ämÈ_Y!aƒðBbÈ	½H; ^»Ã´•Í”¶À¦L±Ué)Úf‘êG¡šBéàˆÑ`µ £FZÓ¥®ÐY6Yq“9q.‚Q2i™-YzZ½&1)E±ëý°‰ÅUÁvôé Ò3­²Ù×ùcÐ?S9—ÂºÂúÔ‚m("¢ù½)ü„¶¥‘ð V±ÉÀ`Æ2´,Çð	U¥R| S2_±(^e]†ºåH×FFôÇŠV^¸™!©W7VÇá‡\“Ð»¦5jÑ(Q(l4s0*ÌF K446¦l­âFî'0jñÁÁº2Ô.cTãÀÊ´÷S…P#š`7%D
ÔtÛŠzv""´
‘ðx-nÚÂ,„Ä{*áŠ 	š"_j…ŽÐ(WÔ0ˆÙVÒº/p¦‘™Å`¥h DôÍ‹µoˆ¶.¼f¿P?²1’ÝK½VáÈª˜l/¤[èrLtö r¬°SÔd¸Vlw¬¬Ìm„CZ°(#+°RÀË!†
S<;H
pzvÄ¦À[©Z¶Rêõ«¿xu*„)v´ÝIÖ­@FÀs±‘œ·&”W:dA-–_ßª¹{0bË%æYÌGoÞ*•s‰ë,ÖzKwÏ¬7ÏHÆúÛø˜KÇ2î*¾Ø6BÂgk©(–sª©‡Ó”.z =AÕj®´ƒ…Üh´»L60@|ØãLU³`Áô*ïn¹¡­ùé	CbŸj•%A¥AÎ(5º D ­°øH’ÃVÛ91…LŸâ~ó-Q–µGSnÛO&!YZºÜmÈËÖ
:¸õÌ´´ó,Œ¯;xÌ?3ïø€ #ubûBå/Êþea“ßÞãARè¶óóÌåë,gI¥©t&rÝÆ|,fpáKKF\[ÿ gî%ÃçÇž¹`ÓÕ«ðš`vbË m€@=fÀw†(±SÆèhS¬+û˜&ºÍ¦K1–ÏŽ5™£èÃC¾(½Ž8,ØÌ6¹à±Æ:#àé©bßù,÷ô:ËwÇ¬ËYèÐÅwöC8»ßhe­;Ù4²NPænÇG‹[%¾“ÒssüKŒé«Q .ÐcuÁ!‚ÂòÓc!ÞœŽ}hš	q†%‰-’#*‘Ã«8}ºæ ‰Ø%.Ÿ^—Òb`ÏbÙ¸¬5Cl2À¦ÿ ˜•µµÛ+=;NÓ³5a*°ÿ 3'¤oœšÌç~ÓÌ§`VD \ÅÝ…(½,œèq¦³¼ AÓ‘ æ³¨7¯A9Jµp}Š<Uw†Ú½~ežœ¿dÎ¯Ô54.+'¶‘µEeªºöÛ{¼Üjàöþf,½M1óÍÇ¤y¹š?¹ˆ×ÌqíÝ ¬mW—7YÜ7á¼zs3]ý¾á–²</´ÜóŸ4J/,wõŸÿÚ ?©‚ê­¼J Á'$ƒÀ„"1ézC„;h:gÁÛ<ã¯ƒõ+¯Hÿ –?ÌýÎ>gÑœN¿TVšZ"ÝIiiiiL·^Óþ
‘[Ênç˜3Îÿ šyC;¯†w_Êåx.ÓÜ=®1+=ô0ÉVn£RÞDš\ô€o¶h•[¹’¬¾’Ž/PàH¦üXR”9:Û¦aêà•hjÜÞOÀê–µ¦U_EB„E›…	˜UF”ÏR‚§V §¹ü©6µíàV€3›tFäÃ”TÞ±¾}£Êûô‡NtRágp
@ ôe:§~âØÇ)Ûà¼Ù%ÃÔÀ[
«/=%Ä(§ñ®¾þÑÍƒ«Ú` À¤
9.²±niŠ(+W]¢¸+¼:—0TVUù&ŒUb1w\T¬NñµOüœÃÒ_„ù‰:î=DùœXù•Z×yB­êñÕ‚t_ ¢5•[]Üëýç–ÌdE/¡—þ’àóÑ j)¤
èH©d5Ñ
i°æX¸Ç€¡}#ÜøƒÔ–ã)uÄâ`³¸2àTMP™9ŒÛ¥xVtN”m8å)ÂEçÞh©B¾¯åWJeÅÏ gx`»EÖ. ,ÀèÏÄù¿Z—‚T7îÊ»‹?X3&"‰÷ éC ý\Q4#ÖØ$S¨®%DÙ*?²h«íÚÅÕ­T·Ò»¸÷ˆ©kb4¡qßüNçâWøÏ —ÊåãÚ+tâ¸—GIk¢ÿ ëÏˆ·-|=y–vÁzÖñq|¡FŠsÄâ
ºAåìîÄˆNŸ1o+
•éòJë_$ ­5jú—øŸ‚T[b+ŒEÿ H”)WááD¼{M½çÕÿ ŸÿÚ ?Hîi_–y+<µžZÇýLò˜ò˜ò–pú6Ë³<¥ž\T}Ï‡î~çîpOÔ?|ËÖ­O–¤¤¤¤¤²Y,–JJN%œ ‚ÌÓ˜ÊI2r$”íð€+Ï„ß|Ë»ù‡ýD¸´/IcúIQ&®ú‚‘YôE
ã¹<¶–Ú4…êëƒ ‹ÈBÂÕ0:‚U[Ä©