<?php

use Bitrix\Main\Localization\Loc;
use    Bitrix\Main\HttpApplication;
use \Bitrix\Main\Loader;
use Bitrix\Main\Config\Option;
use Bitrix\ModuleORM;


Loc::loadMessages(__FILE__);

$request = HttpApplication::getInstance()->getContext()->getRequest();

$module_id = htmlspecialcharsbx($request["mid"] != "" ? $request["mid"] : $request["id"]);

Loader::includeModule($module_id);

$moduleObject = new ModuleORM\Helper();

$listTable = $moduleObject->getList();
$moduleObject->action();
$aTabs = [
    [
        "DIV" => "Set",
        "TAB" => 'Добавление записи',
        "TITLE" => 'Введите имя',
        'OPTIONS' => [
            [
                'ADD',
                'Название записи',
                '',
                ["text", 40]
            ]
        ]
    ],
    [
        "DIV" => "Delete",
        "TAB" => 'Удалить записи',
        "TITLE" => 'Выберете записи для удаления',
        'OPTIONS' => [

        ]
    ],
];
$tabControl = new CAdminTabControl(
    "tabControl",
    $aTabs
);

$tabControl->Begin(); ?>
<form action="<? echo($APPLICATION->GetCurPage()); ?>?mid=<? echo($module_id); ?>&lang=<? echo(LANG); ?>" method="post"
      enctype="multipart/form-data">
    <? $tabControl->BeginNextTab(); ?>


    <? __AdmSettingsDrawList($module_id, $aTabs[0]["OPTIONS"]); ?>
    <? $tabControl->BeginNextTab(); ?>


    <tr>
        <td>Имя Записи</td>
        <td>Удалить?</td>
    </tr>
    <? foreach ($listTable as $value): ?>
        <tr>
            <td><?= $value['NAME'] ?></td>
            <td>
                <input type="checkbox" name="DELETE[]" value="<?= $value['ID'] ?>">
            </td>
        </tr>
    <? endforeach; ?>



    <? $tabControl->Buttons(); ?>
    <input type="submit" name="apply" value="Применить" class="adm-btn-save"/>


    <?
    echo(bitrix_sessid_post());
    ?>

</form>

<?php $tabControl->End(); ?>
