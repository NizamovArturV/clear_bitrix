<?php
use Bitrix\Main\Localization\Loc;
use    Bitrix\Main\HttpApplication;
use \Bitrix\Main\Loader;
use Bitrix\Main\Config\Option;
use Bitrix\ModuleFirst; //Заменить на свой namespace

Loc::loadMessages(__FILE__);

$request = HttpApplication::getInstance()->getContext()->getRequest();

$module_id = htmlspecialcharsbx($request["mid"] != "" ? $request["mid"] : $request["id"]);

Loader::includeModule($module_id);

//Примерная логика установки свойства, набросал на коленке, лучше описать функцию в классе
$success = false;
if (isset($_POST['property1']) && isset($_POST['apply'])
    && $_POST['property1'] !== 'Значение по умолчанию' && $_POST['property1'] !== '') {
    $moduleObject = new ModuleFirst\Helper;
    $moduleObject->setOption('property1', $_POST['property1']);
    $success = true;
}

//Описание табов, которые будут отображаться на странице настроек, подробнее в документации
$aTabs = [
    [
        "DIV" => "Settings",
        "TAB" => 'Настройки моего модуля',
        "TITLE" => 'Введите настройки',
        'OPTIONS' => [
            [
                'property1',
                'Свойство 1',
                'Значение по умолчанию',
                ["text", 20]
            ]
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
            echo $success ? 'Свойство установлено' : "Пока нет"; //Сообщение об успешной установке свойств, можно удалить
            __AdmSettingsDrawList($module_id, $aTab["OPTIONS"]);
        }
    }

    $tabControl->Buttons();
    ?>

    <input type="submit" name="apply" value="Применить" class="adm-btn-save" />
    <input type="submit" name="default" value="По умолчанию" />

    <?
    echo(bitrix_sessid_post());
    ?>

</form>

<?php $tabControl->End();?>
