<?php
namespace Bitrix\SberBankStart;

use Bitrix\Main\Config\Option;



class Helper {

    public string $moduleID = 'sberbankstart'; //Изменить на ID своего модуля

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

    public function actions() {
        if (isset($_POST['apply'])) {
            foreach ($_POST as $key => $value) {
                if ($key === 'apply') continue;

                if ($value) {
                    $this->setOption($key, $value);
                }
            }
        }
    }


}