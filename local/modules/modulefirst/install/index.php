<?
use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

Class ModuleFirst extends CModule
{
    var $MODULE_ID = "modulefirst"; //Изменить на ID своего модуля, название класса тоже
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
        $this->MODULE_NAME = 'Обычный модуль'; //Изменить на название своего модуля
        $this->MODULE_DESCRIPTION = 'Описание обычного модуля'; //Изменить на описание своего модуля
    }


    function InstallDB($install_wizard = true)
    {
        RegisterModule("modulefirst"); //Изменить на ID своего модуля
        return true;
    }

    function UnInstallDB($arParams = Array())
    {
        UnRegisterModule("modulefirst"); //Изменить на ID своего модуля
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