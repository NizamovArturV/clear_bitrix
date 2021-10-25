<?php
namespace Bitrix\ModuleFirst; //Заменить на свой namespace

use Bitrix\Main\Config\Option;



class Helper {

    public string $moduleID = 'modulefirst'; //Изменить на ID своего модуля

    /**
     * Удаляет настройку модуля
     * @param $name
     * @return mixed
     */
    public function deleteOption($name) {
        return Option::delete($this->moduleID, array(
            'name' =>$name));
    }

    /**
     * Устанавливает настройку модуля
     * @param $name
     * @param $value
     * @return mixed
     */
    public function setOption($name, $value) {
        return Option::set($this->moduleID, $name, $value);
    }

    /**
     * Получает настройку модуля
     * @param $name
     * @return string
     */
    public function getOption($name) :string {
        return Option::get($this->moduleID, $name);
    }



}