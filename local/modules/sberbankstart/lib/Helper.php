<?php
namespace Bitrix\SberBankStart;

use Bitrix\Main\Config\Option;
use Bitrix\Main\Application;


class Helper {

    public string $moduleID = 'sberbankstart'; //Изменить на ID своего модуля

    /**
     * Удаляет настройку модуля
     * @param string $name
     * @return mixed
     */
    public function deleteOption(string $name) 
    {
        return Option::delete($this->moduleID, array(
            'name' =>$name));
    }

    /**
     * Устанавливает настройку модуля
     * @param string $name
     * @param string $value
     * @return mixed
     */
    public function setOption(string $name, string $value) 
    {
        return Option::set($this->moduleID, $name, $value);
    }

    /**
     * Получает настройку модуля
     * @param $name
     * @return string
     */
    public function getOption(string $name) :string 
    {
        return Option::get($this->moduleID, $name);
    }

    /**
     * Установка настроек модуля
     */
    public function actions() {
        $postArr = Application::getInstance()->getContext()->getRequest()->toArray();
        if (isset($postArr['apply'])) {
            foreach ($postArr as $key => $value) {
                if ($key === 'apply') continue;

                if ($value) {
                    $this->setOption($key, $value);
                }
            }
        }
    }


}