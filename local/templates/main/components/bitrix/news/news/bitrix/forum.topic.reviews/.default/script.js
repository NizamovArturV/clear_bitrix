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
				while(ii++ < 50 && (selec���� JFIF ,,  �� � 			

��;��<}Va��Uq #X���K=����W H�!jj�kP���f�K8;��ٽwa��U�P�\d
P�F���
ҳ��o��E����_~h�Mr�/k�7��L��]��Y��:x�j��^L���x��P rW�q��rWQ��Y�S�/��%5 �$'H�/&�Q����5�?���$����+R�}��=�k��:F`+���W_��7қD�N���t�A���y���Y3O3+iô֕���P��A�\��V,H��YghD(����m�^��s�p����z��j�wƨ����'q��VZ�jӫ����;44y�����5�~+��O\��6�����ߑ8�V,iA�7>潮ϤQɢ��0+p:@q�Q��v\�W�S��r��rK�۱��[�
	�+�̝Ԕ������+o�M�,�-��l{D�ٞP��tp�K
�"fĬk76�l��;bg?�إ�Y�ǻ3ēl��K�fA)����#�m��Ű��k�tR0e+��Z�X�o��3;~65��
�+\�Q&�k���A
���˻�,O�9�Z3=φyd�5����	���ؙ��ym��nH脳��X�����>(��ڻzϝl�r�#4�%ݙђ�KK�a��ݲn�R��"�8�y6�l2H6'M߲
���l�oa�ge�6M�?Z���@݃)�X��l�2�m�I6��GD]�;&y?�S��Y[� X��&�g�{1x�k>2�j��V�u(���t��M1��@0�9������ED*w'��
:�6	� X\���		q>R��qx^hu_0VU\!EW&�֍���� �U�F�F��8C9q���T �B���¨��'�|`d�d�d�9��2f�!<fתl�j �ˢ������t�"�y�UJ��H�V��T*�P��^�hU�V1X�cU�V`V`V`V+8UUUUUU\��I�bc\;B�m��cWi~�cxUW����jM��j�
*p�]U�)�Ӈ�\�r�K���U�'�9~�5\�UG����<:st�菈yzrtUUU
� �7EӉ���  cA�cU�X�X�X�X�|c����<L)cq8��=bz�����'�OX���bz��e4�+����^�{U�W5Tr������Fౕ��H��k��� �hr96J�|�%ٖU�	 Y�Nh*��Nhp,X�
� ��!3yn�z�"�+�� ��;�g,�Q<�N�r��UB��4�QQQA�çp�b�W�t��Mw��\y���U
����AB�]��	�:����**B�Pc�lK˝�H4�#��(�k��M�?�� ?��t��7t/�͏�8���<���3yA����� �� ?�;�]��٩8D� �Dr#���G"9Ad�,���ĒM��I#��"������~\
�FRf�A����ST�B/0����ϊZ�\�S.^�{�*��G<>�)#�������Tb�����46I\����x��~�)80!z_1^��W���|��z?9�^��|�9�^���K�?��zg�~�����j��~��W��J����W�~�*��ҥV��W��~�*��ҽ�����6�� f�� f��F�
i!�eMUT�b.��u	�"M{��4|7,F5;�O^�zoXaP�At��R%������*� �)�Ī�q̜���W5\�7�vv}���E�,-��IBqA�ee��I�s�1a�ͳޜ�S?F
@s`̢H�۔`�T�6'��s�>���O��߸X m�֯�-���� �OR���̏O*):�"��aI����W[�:��fӸ:�즉8�����=��U����O��z�H�1��j����M=^�q՜�XC�Ԣ��5�sMt��X�X��x�>J�$y��L��b�N���NP�?G	��Y'B�@��B^�}n�"-4*�����s�u���{�c��Uu�v�Q�����j��G����Zu�)��ٞ��:i8�lVi�	�m�֩jH�^>J�����i�P)a��Q� ⥴C+���S���{Q�TY���n]?�	6�OK�N�7�mq$�S���]/���w�X��My��ҧ
5n����jc�OS�����>����y���Mvm�Z�6�x�H�`@�-\�˜4�As��5F�w�B�N��΅��-��}$Z�-���K>�2�_3(Ucɮ��l��~)f�젳���a��eQc�B��u�+�ΣԤk��اQ�>��V��Ny���\>Ù����a����3Rݪ��T� pT�2C��u��M���%���Wsy��Fۗ�� 6l��@ε��*4�@?
�2��NW���];�_�]�.c�Z��Y*�#�>�cX��.��p �s��+�K�%�+[�Q�
=_����5� f�k���KCJ�t�͔�8��"�lZ�Xѿ}����.�GԀ�NZ��\��&c��Ӟ��wdt#P�b{�wlOAoc
[)_�z�0
[��쿱;�@���[#l{�+�����EN\��uv��S�Kc��h�f�UVa{g�	�fz.: +�~*���sy�S�"����z� ����2��߷wj���0-�G4/��2����W˴�D�h�����P-��Z�<�������W�S�!m2v4j@��.(��t��O)1b&���v��~*���Nbo9C�4�>|�l\�����^�aC��#��Gf� �e�ȵ������l9w�\@�O^c��'�-(b���ft��6e�0o>Ry������P�Sܧ�Or���\ۊ��W>��6�7�.q��sӿ��zw���N� ҹ���W0��W=;� J��\��sS��:�n��&�S���<#n�*��1a���i{΅�;L�)*��I�+g�>)3���M�[��{���8y:�Hjr�4����\�T�.kqk�3��OQ�?�� ?!5�r�q�ku�f;x��l@ШC�D�J����󝁸�9��?��լ�s��������mKc��*�����
(�$���W�_J���w�뷯x ������ ���3a��YW� �b�r*��Y��򎏝Agk���
��>��p�fG�?_qÿ��N��]��W�� �o��
b��zB�'���Ϩ~	��/?�!j����:�t���*�q
6[#��L��ߡ.��O����HE�?���.��g�'�:�[V��;'��r��^l�D��;����߾�{J�?S�)��}}&�j���L���o|KI�Z��0���Dq�[��ر��YxN�Z��cfϗ,�Q�N������S��^y.|�j�������}|�S:�V�اwt�ޞ
)t�
6�Ab��v�ҝ��ĳ���+��Д.� j���v�WK0�Pe���I ��i-XKJ�4�L�N� �������S� ��Z��R�Z�d��1�R��h֮c�$��R���h6�3�Kt{[��٥دu��R�ksA�Q�*�o�P��ڈ@�'����X�l�� e1���GDO���`��ய�C��_��)�#?B|�����ϧI��E��fX��;�-� T��vP�.L[C�-�n���K����ξ,_���o�xz��s����s�/�q|_����
�W�۷���s��p�h��U�^'Z����ܘ4S�������hyu�IR2�7�8#6����H���s�۸�m�����꘱�|���`�:7��Y���/�6jβ��n|��tb��OC�I�_+��A\�� �eOu�����~Iy��n��G�
����P�.�:�m���K��/y�D��D�t������蠾aR�%{y���6��}
��wc�8o�u�W�	�m�n�������hJt={g��.�a��.��n��b��w��3�4}W��
���v*_r�ƨ(-�!	����M�<�͋�&�Qn���q~_]<{�`�!�q�>��DT>���� �]�-љ�+j���2�:B��w��wM
s��Χ��5�v�� ��k�'�-fZ�4(��B��n���f6hTiB����ڱO]8� ^�҅f���,��pEbV�Fr�`0U�f�֯
z*��9�aH�
�_{~H��z�w�/W��H�����e,��	}n]�هt�]�p=_霉����d�`���e�s�	��P��3*\�� �p	vU�ũF��ʽŭM���x�� �W�R`����5�M���Y���W
��%cڟ��o�$D���ܬ��1�-�C�̲ҟ {���A�@�]Q;�Ϟ�����/QNv��K��~�y��� �i03}ɰ�Z٠Y��cbl�Zw�&�n}Y4q
n��%I 6���z ��%� ��%xWY�>q*�u_q�W��u�����@�?F{�J�c5Rz���-���,R:�lw�a�e��A�B�~��_Q��[׸�E��} ����u�Ѽ0�+�_*���rC��/�N��_��i���\��x���Y߫�.m.+׬��e�����7P��u��	�Ɯ�RX.��l�'�Ӹ�=�_�����������_`Y@Ca�伜A�[
TB�h��(.�9ϰ��s�k�4Dh3w�^��}�-A�:(0��i`�=*)U���ޫo�_ʥ�ͻde|�=�E�95]�e̵�Vf��c�	�dpuc�q���\*��*���wr9T45�y�����4z?�� �m{����o!��*�/.cD�����%N��T�g�o���_oKx�8W�F�;��5m|���LvR����.����] �YX��:YY��'��n`U��Կ��;�����"8���ϰ*vT`�Ÿ>\ޡ�Հː
�w��9��b�spX��9�N��+����Ju�β�~�t�Y(�mՖ`�и���u��y���z�TG����,"�Q{�V���Y���+R
,p�.����n�uI]F�z������Ls��U�l��f��2��u��h����'�2n��==�
 ����@ �81zn�e���wv�~j6 z:v�vK<q�eYAE��%n�-6FB��b#�$5q�F��4�6u2?<zb�Y�<�G��*�04ɪ>\ �a�ԅ�hu�U�;�'_��wrڲ�V!3��)�P9�OD�Y�n����ZZ������>f�qcX��;�����>��:נ�T�(��X�	[�	6X�B�ɄVG�{ݐT�s�վ\ݷ�Q�d�q��$d#r�fK�Ϭ���g�һ�`�
�(���bT�*e�A��[1�[�.丽�هt��zi������е���4�N<�dZ�l@ w�Uy`0�ػ�΂�d��D�]�$��נL��Zk T�)D�Fm�AH �l�M<=2����k�����J�A�ʟ�����aT�
�$(~�p)�v��r���;G����5nכ���phҪW#1�S��b UX�@�7�B* . n�"�����xGlY�6�h�or2�q.6�W�E�=��b� �*���#"��k_�GOi����k��:T�������y�VQF��%�%u��@�(��E؄AS�Dh�U�ʦ�qR�E��)�0R�(gGLٖ�kؤ�n=�Au�dUcq���!���7���.�:���f`XY�L���������F�P� �.\2H���Ƽ�2����ٳe�����\�h1G�n�-��T��7�	����6
z�Õ��*6Y�$�w����R���(�㴪z�Ht�i�4=��h9;��m�[h��	)e� �Qz�n(�����EVWZ1�4Ɓ��Ze�R�F:�?��1UY�`tm/F�
Fd�G��Jq�4f��I���@^.�:�nǧ���u�}��̀�i�j���g�8��]��E�1�Hrf���R.�q�	�W���Q���O�k6�����Ă�� a%wG�-�-NR'ZI'�1*�,�V�軈ܲ&Ґ�7���B�ʘ�ʬ��o͉	�E��i��
5)e
}G3r�e�h@�򓍠eD�ɮaOL���,�f��-4y� ��br�b^����&��L%�7
Lt��ĖяnVN�ٗj+\�H

f���(� �s���aȾ^�9�$�5��M�� �BZ�]�FND�t1-��
�7R� �S���/��e
�2r0�z�����RO�qdXD&H��Q3�13«�q�2+_D`Nlhf6�f�~�l���&����*�'Z 6�����j��\��b���@��G���*7�.ұUբKj��y�Mk�'"}%��"[���_�7=Z�a!q
�{<�MK�r��!((*����a
��I�&"��
�3PQ�"g>b�e� ��(��=5��*�J2"�2Ⲩ�UU)Ԩ�U� ��ف�Q؍�EV�M�{~($$��Ъ��b�W�d�&�� �'���i�ڀ5�DZ&��ԥxe�d��
�E�k��TK
�����b���79���+,��Խ{�؎`�lC@�Vx�rGث�@$�R19�A��-I	��tZ�2RL*�4��l{���U�=�3O����v�=�����x5��÷O
�{
w�a�iЭ��w����$ɧ�4�v� >&!� ��Êx㿀.��s%�blZ�����!S^�%����	)f���ӯ�� =F邾�C���N,?h��)l�41��Lx'�="���DJ4g;�&�`�i��,��4^�D �I�Ԫ� �Ȝa��5���58t` x��}
)	c;��� z\:Q���Q
.�z!VEf��5;*J�rcŷT�n�j�su
��X@�2�M5�YD���3�c߬@8V-ɲ3:�8�!��@�ASJD"M
LV*���% HP"'4�����WV�7q��
�tk�(+ҹ�-�̡B�̮	-*����;�.�*�� ��@(�G��FDJ��Q��T� �
�����9$��u��t��Cy}X����qe��.����j2����7Y@ ���{�<D%&��q%��6"�)��$����snPm��L��c{yܵ�E�����/���?FS�/�lvC<D�@QU��� ���{��b�CK��AB����G��.l�)^�a�|��c��UI�c���>���[7Y�,�������aP�Ġ���&R�.]�N��_0M��H^H+�b��G}�YP���M��o��u���k{�Hް��� ͠�5] ܕ�
����*H�[a�,�n���F8�������9)o��s���
�u5�q+��Nu�
�@���e�ih7�Ĺ#H
 �/�(Y��e�4�c���l��K�?�pވ�"Y�J�Vվ切ݽ^�U�QV���*�̛�f�)��R)�=����_I�/�)k'̫9���1+�Y�	Ms	�9�إ�KcKP(	�x��b�bԶ¸	�́�3��k���G��.\��Rd@d�"V��(�4�к�ec�������j`����az	�by0���*=)��f�
�H}�Z(WF���E�jK�J��vQor������p0��m�_�Y!a��Bb�	�H; ^�ô��͔���L�U�)�f��G��B����`� �FZӥ��Y6Yq
�tۊzv""�
��x�-n��,��{*� 	�"_j���(W�0��V��/p����`�h D�͋�o��.�f�P?�1��K�V�Ȫ�l/�[�rLt� r��S�d�Vlw���m�CZ�(#+�R��!�
S<;H
pzvĦ�[�Z�R����xu*�)v��I֭@F�s����&�W:dA-�_ߪ�{0b�%�Y�Go�*�s��,�zKwϬ7�H�����K�2�*��6B�gk�(�s���Ӕ.z�=A�j�����h��L60@|���LU�`��*�n������	Cb��j�%A�A�(5� D ���H��V�91�L��~�-Q��GS�n�O&!YZ��m���
:��̴��,��;x�
�[�n�3�� �yC;��w_��x.��=�1+=�0�Vn�R�D�\�o�h�[������/P�H��XR�9:ۦa���hj��O�ꖵ�U_EB�E��	�UF��R��V�����6���V�3�tF���Tޱ�}����NtR�gp
@ �e:�~���)���%���[
�/=%�(������̓��`���
9.��ni�(+W]��+�:�0TVU�&�Ub1w\T�N��O����_���:�=D��X��Z�yB���Ղt_��5�[]�����dE/������� j)�
�H��d5�
i��X�ǀ�}#���Ԗ�)u��`��2�TMP�9�ۥxVtN�
�A�����N�1o+
���J�_$��5j�����T[b+�E� �H�)W��D�{M���� ��� ?H�i�_�y+<��Z��L���p�6��<��\T}χ�~��pO�?�|
���<���4���� ��B��0:�U[��