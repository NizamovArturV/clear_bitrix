<?php
use Bitrix\Main\Localization\Loc;
use    Bitrix\Main\HttpApplication;
use \Bitrix\Main\Loader;
use Bitrix\Main\Config\Option;
use Bitrix\SberBankStart;

Loc::loadMessages(__FILE__);

$request = HttpApplication::getInstance()->getContext()->getRequest();

$module_id = htmlspecialcharsbx($request["mid"] != "" ? $request["mid"] : $request["id"]);

Loader::includeModule($module_id);

$sberHelper = new SberBankStart\Helper();
$sberHelper->actions();

$aTabs = [
    [
        "DIV" => "Settings",
        "TAB" => 'Настройки моего модуля',
        "TITLE" => 'Введите настройки',
        'OPTIONS' => [
            [
                'TOKEN',
                'Токен авторизации',
                '',
                ["text", 50]
            ],
            [
                'LOGIN',
                'Логин',
                '',
                ["text", 50]
            ],
            [
                'PASSWORD',
                'Пароль',
                '',
                ["text", 50]
            ],
            [
                'TEST',
                'Тестовый режим',
                'N',
                ["selectbox", [
                    'N' => 'Нет',
                    "Y"  => 'Да'
                ]]
            ],
        ]
    ],
];



$tabControl = new CAdminTabControl(
    "tabControl",
    $aTabs
);

$tabControl->Begin();?>
<form action="<? echo($APPLICATION->GetCurPage()); ?>?mid=<? echo($module_id); ?>&lang=<? echo(LANG); ?>" method="post" enctype="multipart/form-data">
    <?
    foreach($aTabs as $aTab){

        if($aTab["OPTIONS"]){

            $tabControl->BeginNextTab();
            __AdmSettingsDrawList($module_id, $aTab["OPTIONS"]);
        }
    }

    $tabControl->Buttons();
    ?>

    <input type="submit" name="apply" value="Применить" class="adm-btn-save" />

    <?
    echo(bitrix_sessid_post());
    ?>

</form>

<?php $tabControl->End();?>
