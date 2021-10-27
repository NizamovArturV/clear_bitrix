<?
use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

Class SberBankStart extends CModule
{
    var $MODULE_ID = "sberbankstart"; //Изменить на ID своего модуля, название класса тоже
    var $MODULE_VERSION;
    var $MODULE_VERSION_DATE;
    var $MODULE_NAME;
    var $MODULE_DESCRIPTION;
    var $MODULE_CSS;
    var $MODULE_GROUP_RIGHTS = "Y";

    function __construct()
    {
        $arModuleVersion = array();

        include(__DIR__.'/version.php');

        $this->MODULE_VERSION = $arModuleVersion["VERSION"];
        $this->MODULE_VERSION_DATE = $arModuleVersion["VERSION_DATE"];
        $this->MODULE_NAME = 'Оплата сбербанк'; //Изменить на название своего модуля
        $this->MODULE_DESCRIPTION = 'Модуль оплаты Сбербанка для редакции старт+стандарт'; //Изменить на описание своего модуля
    }


    function InstallDB($install_wizard = true)
    {
        RegisterModule("sberbankstart"); //Изменить на ID своего модуля
        return true;
    }

    function UnInstallDB($arParams = Array())
    {
        UnRegisterModule("sberbankstart"); //Изменить на ID своего модуля
        return true;
    }

    function InstallEvents()
    {
        return true;
    }

    function UnInstallEvents()
    {
        return true;
    }

    function InstallFiles()
    {
        return true;
    }

    function UnInstallFiles()
    {

        return true;
    }

    function DoInstall()
    {
        $this->InstallFiles();
        $this->InstallDB(false);

    }

    function DoUninstall()
    {
        $this->UnInstallDB(false);
    }
}
?>