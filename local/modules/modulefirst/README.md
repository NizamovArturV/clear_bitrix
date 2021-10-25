Файлы для установки и работы самого простого модуля 
Название папки замените на id Модуля 
Ознакомьтесь с файлами, замените нужные строчки и логику 
Установите модуль через административный интерфейс
Готово!
Получить данные на любой странице можно с помощью:
Bitrix\Main\Loader::includeModule('modulefirst');
$moduleObject = new Bitrix\ModuleFirst\Helper;
var_dump($moduleObject->getOption('property1'));
