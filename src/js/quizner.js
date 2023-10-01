/***
 * 
  _ Quizner _

  Version: 0.4
  Author: PaulBash
  My github: github.com/Paulbashk
  My telegram: t.me/CodeBash

*/
class Quizner {
  // Константы
  _prefixPlugin = '[ Quizner ]'

  // Коды ошибок
  _Errors = {
    REQUIRED_OPTIONS: 'Отсутствуют обязательные опции: { %i% }',
    MAIN_ELEMENT_NULL: 'Основной элемент по селектору %i% не найден',
    ARRAY_OPTIONS: 'Опции questions, answers должны быть массивом',
    BUTTON_OPEN_UNDEFINED: 'Не найдена кнопка(и) по селектору %i%',
    ARRAY_QUESTIONS_EMPTY: 'Список questions пуст',
    ARRAY_RESULTS_EMPTY: 'Список answers пуст',
    TEMPLATE_NULL: 'Не найден указанный шаблон %i%',
    TYPE_ANSWERS_NULL: 'Не найден указанный тип ответов %i%',
    QUESTION_FAIL:
      'В вопросе с index %i% допущена ошибка в заполнении. Обязательные поля: { question, type, answers }',
    BUTTON_NEXT_NULL: 'Кнопка NEXT не найдена по указанному классу %i%',
    BUTTON_PREV_NULL: 'Кнопка PREV не найдена по указанному классу %i%',
    NOT_POSITION: 'Данной позиции %i% не существует',
    NULL_PAGINATION: 'Не найден контейнер пагинации по указанному классу %i%',
    NULL_PAGINATION_ELEMENT:
      'Не найден элемент пагинации по указанному классу %i%',
    NULL_QUESTION_ANSWERS:
      'У вопроса с index %i% отсуствует обязательная опция answers',
    NULL_MODAL: 'Элемент модального окна по указанному id %i% не найден',
    NULL_MODAL_CLOSE_BUTTONS:
      'Не найдены кнопки закрытия по указанному классу %i%',
    NULL_WARNING: 'Элемент ошибки не найден по указанному классу %i%',
    NULL_FOOTER: 'Элемент подвала квиза не найден по указанному классу %i%',
    NULL_HEAD: 'Элемент шапки квиза не найден по указанному классу %i%',
    NULL_RESULT:
      'Произошла ошибка! Ни один из результатов не соответствует указанным критериям баллов к ним или не найден',
    NULL_RESULT_TITLE: 'Не указан параметр title для результата с index %i%',
    CALLBACK_STRING: 'Render Callback функции должны возвращать html-string',
    CALLBACK_NONE: '%i% не найдено',
  }

  // Шаблоны (по умолчанию)
  _templates = [
    {
      name: 'selects',
      className: 'quizner-tmpl-selects',
      render: this._htmlTemplateSelects,
    },
    {
      name: 'results',
      className: 'quizner-tmpl-results',
      render: this._htmlTemplateResults,
    },
  ]

  // Типы ответов (по умолчанию)
  _typesAnswers = [
    {
      name: 'radio',
      prefix: true,
      className: 'radio-questions',
      render: this._htmlTypeAnswersRadio,
    },
    {
      name: 'checkbox',
      prefix: true,
      className: 'checkbox-questions',
      render: this._htmlTypeAnswersCheckbox,
    },
  ]

  _characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  // Элементы
  container
  openButtons = []
  closeButtons = []
  modal
  templates
  template
  footer
  pagination
  paginationText
  paginationBullets
  warning
  head
  buttons = {
    prev: null,
    next: null,
  }

  idModal

  // Состояния и переменные
  _Init = false
  activeIndexTemplate = 0
  activeIndex = 0
  questionLength = 0
  _defaultBall = 0
  balls = {
    max: 0,
    current: 0,
  }

  questionState = []

  // Опции (по умолчанию)
  _options = {
    selector: null,
    requiredField: true,
    prefix: 'quizner',
    questions: [],
    results: [],
    init: {
      modal: true,
      btn: false,
      btnSelector: null,
    },
    resultTextDefault: 'Вы не набрали достаточное количество баллов',
    modal: {
      id: null,
      prefix: 'modal-quizner',
      classNameActive: 'modal-quizner--visible',
      renderModal: null,
    },
    head: {
      visible: true,
      name: 'Квиз',
      render: null,
      className: 'head',
    },
    renderResults: null,
    footer: {
      lastVisible: false,
      className: 'footer',
      classNameHidden: 'footer--hidden',
    },
    navigation: {
      visible: true,
      renderPrevButton: null,
      renderNextButton: null,
      classNameButton: 'button',
      classNameButtonNext: 'button--next',
      classNameButtonPrev: 'button--prev',
    },
    warning: {
      text: 'Для получения результата, необходимо ответить на все вопросы',
      textRequired: 'Для перехода к следующиму вопросу, ответье на текущий',
      className: 'warning',
      classNameActive: 'warning--active',
    },
    pagination: {
      visible: true,
      className: 'quizner-stages',
      classNameBullet: 'stage',
      classNameBulletActive: 'stage--active',
      classNameText: 'text',
    },
    templates: [],
    types: [],
  }

  _requiredOptions = ['selector', 'questions', 'results']

  // on Callbacks
  _Callbacks = {
    init: null,
    questionPrev: null,
    questionNext: null,
    questionChange: null,
    questionLast: null,
    questionLastEnd: null,
    questionFirst: null,
    templateChange: null,
  }

  // События
  _Events = {
    buttonInitQuizCallback: null,
    buttonNextCallback: null,
    buttonPrevCallback: null,
    buttonOpenModalCallback: null,
    buttonCloseModalCallback: null,
  }

  constructor(options) {
    this._options = this._compareOptions(options)

    const isModal = this._options.init.modal

    /* 
      Проверка обязательных полей

      Если выбран режим модального окна, то selector не указывается
      Т.к. модальное окно генерируется в document.body 
    */
    if (isModal) {
      this._requiredOptions = [...this._requiredOptions].filter(
        (option) => option !== 'selector'
      )
    }

    const isNoValidKey = this._isNoValidObject(options, this._requiredOptions)

    if (isNoValidKey.length !== 0) {
      return this._handleError({
        level: 1,
        codeError: 'REQUIRED_OPTIONS',
        message: isNoValidKey.join(', '),
      })
    }

    if (!Array.isArray(options['questions'])) {
      return this._handleError({
        level: 1,
        codeError: 'ARRAY_OPTIONS',
      })
    }

    if (!Array.isArray(options['results'])) {
      return this._handleError({
        level: 1,
        codeError: 'ARRAY_OPTIONS',
      })
    }

    if (options['questions'].length === 0) {
      return this._handleError({
        level: 1,
        codeError: 'ARRAY_QUESTIONS_EMPTY',
      })
    }

    if (options['results'].length === 0) {
      return this._handleError({
        level: 1,
        codeError: 'ARRAY_RESULTS_EMPTY',
      })
    }

    // Поиск селектора для вставки квиза, если init { modal: false }
    if (!isModal) {
      this.container = document.querySelector(options['selector'])

      if (!this.container) {
        return this._handleError({
          level: 1,
          codeError: 'MAIN_ELEMENT_NULL',
          message: options['selector'],
        })
      }
    }

    // Кнопки отображения модального окна или квиза, если init { btn: true }
    if (this._options.init.btn) {
      if (this._options.init.btnSelector === null) {
        return this._handleError({
          level: 1,
          codeError: 'BUTTON_OPEN_OPTION_NULL',
          message:
            'Если вы включили кнопки в опциях init { btn: true }, укажите селектор в опции init: { btnSelector }',
        })
      }

      if (this._getButtonStart()) {
        return this._handleError({
          level: 1,
          codeError: 'BUTTON_OPEN_UNDEFINED',
          message: this._options.init.btnSelector,
        })
      }
    }

    // Добавление пользовательских типов вопросов
    if (this._options.types.length > 0) {
      this._addTypes([...this._options.types])
    }

    // Добавление пользовательских шаблонов
    if (this._options.templates.length > 0) {
      this._addTemplates([...this._options.templates])
    }

    // Инициализация (в зависимости от опций)
    this._initDependsOnOptions()
  }

  /*

    Функция объединяет указанный объект опций с опииями по умолчанию. Возвращает объект опций

    @param options (object) - пользовательские опции
    @return (object) - объект опций

  */
  _compareOptions(options) {
    return Object.assign(
      {},
      {
        ...this._options,
        ...options,
        init: {
          ...this._options.init,
          ...options.init,
        },
        modal: {
          ...this._options.modal,
          ...options.modal,
        },
        head: {
          ...this._options.head,
          ...options.head,
        },
        footer: {
          ...this._options.footer,
          ...options.footer,
        },
        warning: {
          ...this._options.warning,
          ...options.warning,
        },
        navigation: {
          ...this._options.navigation,
          ...options.navigation,
        },
        pagination: {
          ...this._options.pagination,
          ...options.pagination,
        },
      }
    )
  }

  /*

    Пользовательская функция перезапускает квиз, начиная с стартового шаблона и первого вопроса.
    Функция не будет выполнена, если квиз не был инициализирован или был разрушен посредством destroy()

    @return (boolean) - результат выполнения функции

  */
  restart() {
    if (!this._Init) return false

    this.activeIndexTemplate = 0
    this.activeIndex = 0
    this.balls.current = 0

    this.questionState = [
      ...this._formatStateQuestions([...this._options.questions]),
    ]

    // Вкл футер, если он был выключен
    if (!this._options.footer.lastVisible) {
      this.setHiddenFooter(false)
    }

    this.setTemplate(this._templates[0]['name'])
    this.setQuestion(this.activeIndex)

    return true
  }

  /*

    Пользовательская функция разрушает все события, обнуляет состояния, удаляет из html контейнер квиза (модального окна с квизом)

    @return (boolean) - результат выполнения функции

  */
  destroy() {
    if (!this._Init) return false

    const isModal = this._options.init.modal

    // Обнуление состояний
    this.activeIndexTemplate = 0
    this.activeIndex = 0
    this._defaultBall = 0
    this.balls = {
      max: 0,
      current: 0,
    }

    // Обнуление событий навигации
    if (this.buttons.next) {
      this.buttons.next.removeEventListener(
        'click',
        this._Events.buttonNextCallback
      )
    }

    if (this.buttons.prev) {
      this.buttons.prev.removeEventListener(
        'click',
        this._Events.buttonPrevCallback
      )
    }

    this._Events.buttonNextCallback = null
    this._Events.buttonPrevCallback = null

    const removeEventOpenButtons = (callback) =>
      this._eventClickItems(this.openButtons, callback, false)

    // Обнуление событий модального окна и модальное окно
    if (isModal) {
      if (this.openButtons.length > 0) {
        removeEventOpenButtons(this._Events.buttonOpenModalCallback)
      }

      if (this.closeButtons.length > 0) {
        this._eventClickItems(
          this.closeButtons,
          this._Events.buttonCloseModalCallback,
          false
        )
      }

      this._Events.buttonOpenModalCallback = null
      this._Events.buttonCloseModalCallback = null
    }

    // Обнуление событий кнопки инициализации
    if (!isModal && this._options.init.btn) {
      if (this.openButtons.length > 0) {
        removeEventOpenButtons(this._Events.buttonInitQuizCallback)
      }

      this._Events.buttonInitQuizCallback = null
    }

    // Удаление из кода
    if (this.container) {
      if (isModal) {
        this.container.remove()
      } else {
        this.container.innerHTML = ''
      }
    }

    // Обнуление элементов
    this.openButtons = []
    this.closeButtons = []
    this.idModal = null
    this.modal = null
    this.templates = null
    this.template = null
    this.footer = null
    this.pagination = null
    this.paginationText = null
    this.paginationBullets = []
    this.warning = null
    this.head = null
    this.buttons = {
      prev: null,
      next: null,
    }

    this._Init = false
    return !this._Init
  }

  /*

    Пользовательская функция принудительно инициализирует квиз. Если квиз уже инициализирован, функция не будет выполнена.

    @return (boolean) - результат выполнения функции

  */
  init() {
    if (this._Init) return false

    if (!this._options.init.modal) {
      this.container = document.querySelector(this._options.selector)
    }

    if (this._options.init.btn) {
      this._getButtonStart()
    }

    return this._initDependsOnOptions()
  }

  /*

    Функция в зависимости от опций, инициализирует квиз (модальное окно в квизе) и события, для его отображения.

    @return (boolean) - результат выполнения функции

  */
  _initDependsOnOptions() {
    const isModal = this._options.init.modal

    // Инициализация по событию клика по кнопке (btnSelector), если modal: true или modal: false, btn: false
    if (isModal || (!isModal && !this._options.init.btn)) {
      return this._init()
      // Инициализация по событию клика по кнопке (btnSelector), если modal: false, btn: true
    } else if (!isModal && this._options.init.btn) {
      this._Events.buttonInitQuizCallback = (event) => {
        event.preventDefault()

        // Удаляет событие у открывающих элементов после инициализации
        this._eventClickItems(
          this.openButtons,
          this._Events.buttonInitQuizCallback,
          false
        )

        return this._init()
      }

      // Инициализация события клика
      this._eventClickItems(
        this.openButtons,
        this._Events.buttonInitQuizCallback
      )
    }

    return true
  }

  /*

    Функция инициализирует события с валидацией опций и элементов. 
    Рендерит элемент квиза в зависимости от пользовательских опций.

    @return (boolean) - результат выполнения функции

  */
  _init() {
    // Переменные и состояния
    this.activeIndexTemplate = 0
    this.activeIndex = 0
    this._defaultBall = 0

    this.questionLength = this._options.questions.length
    this.questionState = [
      ...this._formatStateQuestions([...this._options.questions]),
    ]

    // Атрибуты
    const classNameModalQuiz = this._clsNotSelector(
      this._options.prefix,
      this._options.modal.prefix
    )
    const isModal = this._options.init.modal
    const classNamesQuiz = isModal
      ? `${classNameModalQuiz} ${this._options.prefix} ${this._options.prefix}--mode-modal`
      : this._options.prefix

    // Формирование html-string квиза
    const htmlQuiz = this._htmlQuiz({
      className: classNamesQuiz,
    })

    // Если квиз в модальном окне
    if (isModal) {
      this.idModal =
        this._options.modal.id && this._isString(this._options.modal.id)
          ? this._options.modal.id
          : this._generateString(8).trim()

      document.body.insertAdjacentHTML(
        'beforeend',
        this._htmlModal({ quiz: htmlQuiz, id: this.idModal })
      )

      this.modal = document.getElementById(this.idModal)

      if (!this.modal) {
        return this._handleError({
          level: 1,
          codeError: 'NULL_MODAL',
          message: this.idModal,
        })
      }

      this.container = this.modal

      // Закрывающие кнопки
      const clsModalCloseButtons = this._clsPrefix(
        'close',
        this._options.modal.prefix
      )

      this.closeButtons = [...this.modal.querySelectorAll(clsModalCloseButtons)]

      if (this.closeButtons.length === 0) {
        return this._handleError({
          level: 1,
          codeError: 'NULL_MODAL_CLOSE_BUTTONS',
          message: clsModalCloseButtons,
        })
      }

      this._initEventsModal()
    } else {
      this.container.innerHTML = htmlQuiz
    }

    // Установка переменных / элементов
    this.balls.max = this.calcMaxBalls()

    this.head = this.container.querySelector(
      this._clsPrefix(this._options.head.className)
    )

    this.footer = this.container.querySelector(
      this._clsPrefix(this._options.footer.className)
    )

    this.warning = this.container.querySelector(
      this._clsPrefix(this._options.warning.className)
    )

    if (!this.head) {
      return this._handleError({
        level: 1,
        codeError: 'NULL_HEAD',
        message: this._options.head.className,
      })
    }

    if (!this.footer) {
      return this._handleError({
        level: 1,
        codeError: 'NULL_FOOTER',
        message: this._options.footer.className,
      })
    }

    if (!this.warning) {
      return this._handleError({
        level: 1,
        codeError: 'NULL_FOOTER',
        message: this._options.warning.className,
      })
    }

    // Пагинация
    if (this._options.pagination.visible) {
      const {
        className: paginationPrefix,
        classNameText,
        classNameBullet,
      } = this._options.pagination

      const clsPagination = this._clsPrefix(paginationPrefix)
      const clsPaginationText = this._clsPrefix(classNameText, paginationPrefix)

      this.pagination = this.container.querySelector(clsPagination)

      this.paginationText = this.container.querySelector(clsPaginationText)

      if (!this.paginationText) {
        return this._handleError({
          level: 1,
          codeError: 'NULL_PAGINATION_ELEMENT',
          message: clsPaginationText,
        })
      }

      if (this.pagination) {
        const clsBullets = this._clsPrefix(classNameBullet, paginationPrefix)

        this.paginationBullets = this.pagination.querySelectorAll(clsBullets)

        if (this.paginationBullets.length === 0) {
          return this._handleError({
            level: 1,
            codeError: 'NULL_PAGINATION_ELEMENT',
            message: clsBullets,
          })
        }

        this.setPaginationBullets(this.activeIndex)
      } else {
        return this._handleError({
          level: 1,
          codeError: 'NULL_PAGINATION',
          message: clsPagination,
        })
      }
    }

    // Установка шаблона по умолчанию
    this.templates = this.container.querySelector(this._clsPrefix('templates'))
    this.setTemplate(this._templates[0]['name'])

    if (this._options.navigation.visible) {
      // Установка навигационных кнопок
      this._getButtonsNavigate()

      // Инициализация событий
      this._initEvents()
    }

    this._callFuncCallback(this._Callbacks.init)

    this._Init = true
    return this._Init
  }

  /*

    Вспомогательная функция для событий кнопок-переключателей шаблонов и вопросов.

    @param event (object) - объект события
    @param action (string) - направление переключения (next - следующий, prev - предыдущий)
    @return (boolean) - результат выполнения функции

  */
  _handleEventHelper(event, action) {
    event.preventDefault()

    if (this.isCurrentTemplate('selects')) {
      // Сохранят результат
      this.saveStateQuestions()

      // Навигация в зависимости от action
      this.setPositionQuestion(action)
    }

    return true
  }

  /*

    Вспомогательная функция для создания/удаления событий клика для указанного массива элементов

    @param items (array) - массив элементов
    @param callback (function) - функция обратного вызова события
    @param isAdd (boolean) - если true, то создание события. Если false, то удаление события.
    @return (boolean) - результат выполнения функции

  */
  _eventClickItems(items, callback, isAdd = true) {
    items.forEach((item) => {
      if (item) {
        if (isAdd) {
          item.addEventListener('click', callback)
        } else {
          item.removeEventListener('click', callback)
        }
      }
    })

    return true
  }

  /*

    Функция инициализации событий квиза (события кнопок-переключателей)

    @return (boolean) - результат выполнения функции

  */
  _initEvents() {
    // События переключателей
    const { next: buttonNext, prev: buttonPrev } = this._getButtonsNavigate()

    // Кнопка: Далее
    if (buttonNext) {
      this._Events.buttonNextCallback = (event) => {
        this._handleEventHelper(event, 'next')
      }

      buttonNext.addEventListener('click', this._Events.buttonNextCallback)
    }

    // Кнопка: Назад
    if (buttonPrev) {
      this._Events.buttonPrevCallback = (event) => {
        this._handleEventHelper(event, 'prev')
      }

      buttonPrev.addEventListener('click', this._Events.buttonPrevCallback)
    }

    return true
  }

  /*

    Функция инициализации событий мобального окна квиза (события кнопок отображения и скрытия)

    @return (boolean) - результат выполнения функции

  */
  _initEventsModal() {
    if (this._options.init.btn && this.openButtons.length > 0) {
      this._Events.buttonOpenModalCallback = (event) => {
        event.preventDefault()

        this.setModal()
      }

      this._eventClickItems(
        this.openButtons,
        this._Events.buttonOpenModalCallback
      )
    }

    if (this.closeButtons.length > 0) {
      this._Events.buttonCloseModalCallback = (event) => {
        event.preventDefault()

        this.setModal(false)
      }

      this._eventClickItems(
        this.closeButtons,
        this._Events.buttonCloseModalCallback
      )
    }

    return true
  }

  /*

    Пользовательская функция событий квиза. Запускает callback в соответствии с выбранным событием из возможных

    @param name (string) - наименование события
      * quizner:init - событие инициализации квиза
      * question:next - событие переключение вопроса на следующий
      * question:prev - событие переключение вопроса на предыдущий
      * question:change - событие изменения вопроса
      * question:last - событие отображения последнего вопроса (по умолчанию, на шаблон: results)
      * question:lastend - событие переключения с последнего вопроса
      * question:first - событие переключения на первый вопрос (не инициализация)
      * template:change - событие переключения шаблонов
    @param callback (function) - функция обратного вызова для события
    @return (boolean) - результат выполнения функции

  */
  on(name, callback) {
    switch (name) {
      case 'quizner:init': {
        this._Callbacks.init = callback

        break
      }

      case 'question:next': {
        this._Callbacks.questionNext = callback

        break
      }

      case 'question:prev': {
        this._Callbacks.questionPrev = callback

        break
      }

      case 'question:change': {
        this._Callbacks.questionChange = callback

        break
      }

      case 'question:last': {
        this._Callbacks.questionLast = callback

        break
      }

      case 'question:lastend': {
        this._Callbacks.questionLastEnd = callback

        break
      }

      case 'question:first': {
        this._Callbacks.questionFirst = callback

        break
      }

      case 'template:change': {
        this._Callbacks.templateChange = callback

        break
      }

      default: {
        return this._handleError({
          level: 1,
          functionName: 'on(name, callback)',
          codeError: 'CALLBACK_NONE',
          message: 'Событие ' + name,
        })
      }
    }

    return true
  }

  /*

    Вспомогательная функция обработки и отображения ошибок в консоль.
    Выводит сообщение по указанному коду ошибки, или только сообщение.
    Если указан код ошибки, и сообщение, то сообщение может быть использовано в коде ошибки посредством замены строки %i% в коде ошибки
    Также, если указано название функции, то название будет выведено совместно с кодом ошибки и сообщением.

    @param level (number) - значимость ошибки. 
      * 0 - критическая ошибка, остановка работы посредством destroy(). 
      * 1 - ошибка, без остановки работы
    @param codeError (string, null) - код ошибки, по умолчанию: null.  
    @param message (string) - сообщение ошибки
    @param nameFunction (function, null) - название функции, с которой связана ошибка. Будет отображен в сообщении ошибки. По умолчанию: null
    @return (boolean) - всегда возвращает false, как результат выполнения кода в месте вызова обработчика ошибки.
    
  */
  _handleError({
    level = 0,
    codeError = null,
    message = '',
    nameFunction = null,
  }) {
    const prefix = this._prefixPlugin

    if (level === 0) {
      this.destroy()
    }

    const codeErrorMessage =
      codeError !== null ? this._Errors[codeError] : codeError

    const errorMessage = codeErrorMessage
      ? codeErrorMessage.replace('%i%', message)
      : message

    const withNameFunction = nameFunction
      ? `${nameFunction} - ${errorMessage}`
      : errorMessage

    const withPrefix = `${prefix} ${withNameFunction}`

    const newError = new Error(withPrefix)

    console.error(newError)

    return false
  }

  /*

    Вспомогательная функция для формирования классов из указанных частей, префиксов
    Возвращает класс или селектор

    @param className (string) - класс или несколько классов, перечисленных через пробел
    @param prefix (string) - префикс по неймингу-БЭМ для классов
    @param selector (boolean) - если true, то строка будет возвращена как селектор. 
    Если false, то строка будет возвращена как класс
    @return (string) - возвращает класс или селектор

  */
  _clsPrefix(className, prefix = this._options.prefix, selector = true) {
    const classes = className.trim()
    const isClasses = classes.indexOf(' ')

    return isClasses === -1
      ? selector
        ? `.${prefix}__${classes}`
        : `${prefix}__${classes}`
      : classes
          .split(' ')
          .reduce(
            (acc, current, index) =>
              acc +
              (index !== 0 ? ' ' : '') +
              ((selector ? '.' : '') + prefix + '__' + current),
            ''
          )
  }

  /*

    Вспомогательная функция для формирования классов из указанных частей, префиксов
    Возвращает только класс, использует функцию _clsPrefix с аргкментом selector = false

    @param className (string) - класс или несколько классов, перечисленных через пробел
    @param prefix (string) - префикс по неймингу-БЭМ для классов
    @return (string) - возвращает класс

  */
  _clsNotSelector(className, prefix = this._options.prefix) {
    return this._clsPrefix(className, prefix, false)
  }

  /*

    Вспомогательная функция проверки на отсуствие / не существование / не определено

    @param value (any) - значение, необходимо для проверки
    @return (boolean) - возвращает true, если элемент не найден. False, если элемент существует

  */
  _isEmpty(value) {
    return typeof value === 'undefined' && !value
  }

  /*

    Вспомогательная функция возвращает максимальное число в массиве чисел

    @param arrayNumbers (array) - массив чисел
    @return (number) - максимальное число в массиве чисел

  */
  _getMaxOfArray(arrayNumbers) {
    return Math.max.apply(null, arrayNumbers)
  }

  /*

    Вспомогательная функция возвращает минимальное число в массиве чисел

    @param arrayNumbers (array) - массив чисел
    @return (number) - минимальное число в массиве чисел

  */
  _getMinOfArray(arrayNumbers) {
    return Math.min.apply(null, arrayNumbers)
  }

  /*

    Вспомогательная функция вызывает указанную функцию с проверкой её существования и типа

    @param callback (function) - ссылка на функцию
    @param args (any) - аргументы функции
    @return (any, false) - результат выполнения передаваемой функции. 
    False - если callback не является функций или не определен.

  */
  _callFuncCallback(callback, args = {}) {
    return (
      callback !== null &&
      typeof callback === 'function' &&
      callback({ Quizner: this, ...args })
    )
  }

  /*

    Вспомогательная функция проверки типа данных указанного элемента на строку

    @param string (string) - значение 
    @return (boolean) - если true, то значение является строкоЙ. Если false, то значение не является строкой.

  */
  _isString(string) {
    return typeof string === 'string'
  }

  /*

    Вспомогательная функция проверки типа данных указанного элемента на boolean значение

    @param bool (boolean) - значение 
    @return (boolean) - если true, то значение является boolean. Если false, значение не является boolean.

  */
  _isBoolean(bool) {
    return typeof bool === 'boolean'
  }

  /*

    Вспомогательная функция проверки типа данных указанного элемента на function

    @param functionLink (function) - значение 
    @return (boolean) - если true, то значение является function. Если false, значение не является function.

  */
  _isFunction(functionLink) {
    return typeof functionLink === 'function'
  }

  /*

    Вспомогательная функция вызывает указанную функцию с проверкой её существования и типа,
    посредством вспомогательной функции _callFuncCallback
    Также, проверяет результат выполнения передаваемой функции на строку

    @param nameFunction (function) - ссылка на функцию
    @param args (any) - аргументы функции
    @return (boolean, string) - результат выполнения передаваемой функции. False - если результат не строка.

  */
  _callbackRender(callback, args) {
    const render = this._callFuncCallback(callback, args)

    if (!render) {
      return false
    }

    if (this._isString(render)) {
      return render
    }

    return this._handleError({
      level: 0,
      codeError: 'CALLBACK_STRING',
      functionName: callback.name,
    })
  }

  /*

    Вспомогательная функция валидирует объект на наличие указанных ключей.
    Возвращает массив отсуствующих ключей у объекта.

    @param obj (object) - объект
    @param keys (array) - массив ключей
    @return (array) - массив отсуствующих ключей у объекта

  */
  _isNoValidObject(obj = {}, keys = []) {
    return keys.length !== 0
      ? [...keys].filter((key) => this._isEmpty(obj[key]))
      : []
  }

  /*

    Вспомогательная функция валидирует значение по передаваемой вспомогательной функции-валидатору.
    Выводит ошибку и указанное сообщение ошибки, если значение не прошло валидацию.

    @param callbackValidate (function) - вспомогательная функция-валидатор
    @param target (any) - валидируемое значение
    @param message (string) - сообщение ошибки
    @return (boolean) - возвращает true, если значение прошло валидацию, false - значение не прошло валидацию

  */
  _withFuncValidType(callbackValidate, target, message) {
    if (callbackValidate(target)) {
      return true
    }

    return this._handleError({
      level: 1,
      message,
    })
  }

  /*

    Вспомогательная функция генерации случайной строки

    @param length (number) - длина генерируемой строки
    @return (string) - сгенерируемая строка

  */
  _generateString(length) {
    let result = ' '
    const charactersLength = this._characters.length
    for (let i = 0; i < length; i++) {
      result += this._characters.charAt(
        Math.floor(Math.random() * charactersLength)
      )
    }

    return result
  }

  /*

    Функция получения NodeList кнопок отображения модального окна или/и квиза

    @return (boolean) - возвращает true, если кнопки не найдены. False - если кнопки найдены.

  */
  _getButtonStart() {
    this.openButtons = [
      ...document.querySelectorAll(this._options.init.btnSelector),
    ]

    return this.openButtons.length === 0
  }

  /*

    Функция устанавливает и возвращает объект кнопок-переключателей шаблонов/вопросов

    @return (object) - возвращает объект кнопок { next, prev }

  */
  _getButtonsNavigate() {
    const {
      classNameButtonNext: classNameNext,
      classNameButtonPrev: classNamePrev,
    } = this._options.navigation

    if (this.buttons.next === null) {
      const buttonNext = this.container.querySelector(
        this._clsPrefix(classNameNext)
      )

      if (!buttonNext) {
        return this._handleError({
          level: 0,
          codeError: 'BUTTON_NEXT_NULL',
          message: classNameNext,
          functionName: '_getButtonsNavigate()',
        })
      }

      this.buttons.next = buttonNext
    }

    if (this.buttons.prev === null) {
      const buttonPrev = this.container.querySelector(
        this._clsPrefix(classNamePrev)
      )

      if (!buttonPrev) {
        return this._handleError({
          level: 0,
          codeError: 'BUTTON_PREV_NULL',
          message: classNamePrev,
          functionName: '_getButtonsNavigate()',
        })
      }

      this.buttons.prev = buttonPrev
    }

    return {
      next: this.buttons.next,
      prev: this.buttons.prev,
    }
  }

  /*

    Функция формирования состояний вопросов исходя из опций указанных вопросов

    @param questions (array) - массив опций вопросов
    @return (array) - возвращает массив объектов вопросов с пустым массивом ответов

  */
  _formatStateQuestions(questions) {
    return [...questions].map((question, index) => {
      const answers = question.answers

      if (this._isEmpty(answers)) {
        return this._handleError({
          level: 0,
          codeError: 'NULL_QUESTION_ANSWERS',
          message: index,
          functionName: '_formatStateQuestions(questions)',
        })
      }

      return {
        ...question,
        answers: [],
      }
    })
  }

  /*

    Пользовательская функция сохраняет текущее состояние выбранных ответов текущего вопроса

    @return (false, array) - возвращает массив состояния объектов вопросов с сохраненными ответами 
    Возвращает False, если квиз не инициализирован

  */
  saveStateQuestions() {
    if (!this._Init) return false

    const { answers } = this.getSelectedAnswers()

    if (answers.length !== 0) {
      this.questionState = [...this.questionState].map((item, id) => {
        if (this.activeIndex === id) {
          return {
            ...item,
            answers: [...answers],
          }
        }

        return item
      })
    }

    return [...this.questionState]
  }

  /*

    Пользовательская функция возвращает объект состояния варианта ответа текущего вопроса

    @param name (string) - массив опций вопросов
    @return (array) - возвращает объект состояния указанного ответа
    Возвращает False, если квиз не инициализирован

  */
  getStateQuestionAnswer(name) {
    if (!this._Init) return false

    const answers = this.questionState[this.activeIndex].answers

    return [...answers].find((answer) => answer.name === name)
  }

  /*

    Пользовательская функция проверки наличия результатов 

    @return (boolean) - возвращает true, если результаты отсуствуют либо не все результаты присуствуют
    Возвращает False, если квиз не инициализирован или все результаты найдены

  */
  isStateAnswerResults() {
    if (!this._Init) return false

    const unvalidate = [...this.questionState].filter(
      (question) => question.answers.length === 0
    )

    return unvalidate.length === 0
  }

  /*

    Пользовательская функция проверки наличия результатов указанного вопроса по его id (номеру в опциях)

    @param id (number) - номер вопроса
    @return (boolean) - возвращает true, если результаты найдены
    Возвращает False, если квиз не инициализирован или результаты не найдены

  */
  isStateQuestionAnswer(id) {
    if (!this._Init) return false

    const { answers } = this.questionState[id]

    return answers.length !== 0
  }

  /*

    Пользовательская функция возвращает массив объектов выбранных ответов у вопроса по id (номеру в опциях)

    @param id (number) - номер вопроса
    @return (array) - возвращает массив выбранных ответов
    Возвращает False, если квиз не инициализирован

  */
  getStateQuestionSelected(id) {
    if (!this._Init) return false

    const { answers } = this.questionState[id]

    return answers.length !== 0
      ? [...answers].filter((answer) => !this._isEmpty(answer.checked))
      : []
  }

  /*

    Функция возвращает из массива объектов с параметром ball массив чисел (баллов)

    @param array (array) - массив объектов
    @param defaultBall (number) - значение по умолчанию (если параметр ball отсуствует)
    @return (array) - возвращает массив чисел (баллов)

  */
  _mapFromResultsToBalls(array, defaultBall = 100) {
    return [...array].map((item) => {
      const { ball: userBall } = item

      return this._isEmpty(userBall) ? defaultBall : userBall
    })
  }

  /*

    Пользовательская функция подсчета баллоа
    Если обязательные поля не установлены, то при отсуствии выбранных полей,
    значение балла у вопроса будет задано по умолчанию 0 или defaultBall у вопроса

    @return (number, boolean) - возвращает число в виде набранного кол-ва баллов
    Возвращает False, если квиз не инициализирован

  */
  calcResultsBall() {
    if (!this._Init) return false

    return [...this.questionState].reduce((acc, question, index) => {
      const isAnswers = this.isStateQuestionAnswer(index)

      if (isAnswers) {
        const answersSelected = this.getStateQuestionSelected(index)

        return (
          acc +
          [...answersSelected].reduce((accAnswer, answer) => {
            const { ball: userBall } = answer

            const ball = this._isEmpty(userBall) ? this._defaultBall : userBall

            return accAnswer + ball
          }, 0)
        )
      } else {
        return acc + this.getQuestionDefaultBall(index)
      }
    }, 0)
  }

  /*

    Пользовательская функция подсчета максимального количества баллов

    @return (number, boolean) - возвращает число в виде максимального количества баллов
    Возвращает False, если квиз не инициализирован

  */
  calcMaxBalls() {
    if (!this._Init) return false

    const questions = this._options.questions

    return [...questions].reduce((acc, question, index) => {
      const { answers } = question
      const defaultBall = this.getQuestionDefaultBall(index)

      if (answers.length === 0) return acc + 0

      const numberBallsAnswers = this._mapFromResultsToBalls(
        answers,
        defaultBall
      )

      return acc + this._getMaxOfArray(numberBallsAnswers)
    }, 0)
  }

  /*

    Пользовательская функция сравнивает кол-во баллов в диапазоне с возможными указанными в результатах баллами

    @param ball (number) - кол-во баллов
    @return (object, null, boolean) - возвращает объект результата, если результат найден
    Возвращает null. если результат не найден
    Возвращает False, если квиз не инициализирован

  */
  calcCompareBall(ball) {
    if (!this._Init) return false

    // Форматирование
    const resultsBallArray = this._mapFromResultsToBalls(this._options.results)

    // Поиск подходящих значений
    const filterBalls = [...resultsBallArray].filter((_ball) => ball >= _ball)

    if (filterBalls.length === 0) {
      return {
        title: this._options.resultTextDefault,
        ball: 0,
      }
    }

    // Поиск максимального значения
    const findMaxBall =
      filterBalls.length === 1
        ? filterBalls[0]
        : this._getMaxOfArray(filterBalls)

    // Поиск первого результата с найденным кол-вом баллов
    const indexResult = [...this._options.results].findIndex(
      (result) => result.ball === findMaxBall
    )

    return indexResult === -1
      ? null
      : {
          id: indexResult,
          ...this._options.results[indexResult],
        }
  }

  /*

    Функция генерирует html код модального окна и возвращает его в виде строки

    @param props (object) - принимает объект { quiz, id }
      * quiz - html строка кода квиза
      * id - id модального окна
    @return (string) - возвращает html строку модального окна с квизом

  */
  _htmlModal(props) {
    const { quiz, id } = props

    const { prefix, renderModal } = this._options.modal
    const clsPrefix = (className) => this._clsNotSelector(className, prefix)

    const htmlId = `id="${id}"`

    const callback = this._callbackRender(renderModal, {
      quiz,
      prefix,
      htmlId,
    })

    if (callback) {
      return callback
    }

    return `
      <div class="${prefix}" ${htmlId}>
        <div class="${clsPrefix('overlay')}"></div>
        <div class="${clsPrefix('close')}">
          <i>
            <svg
              viewBox="0 0 23 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M1.4 1L21.4 21" stroke-width="2" stroke-linecap="round" />
              <path
                d="M21 1L0.999998 21"
                stroke-width="2"
                stroke-linecap="round" />
            </svg>
          </i>
        </div>
        <div class="${clsPrefix('content')}">
          <div class="${clsPrefix('window window--content')}">
            ${quiz}
          </div>
        </div>
      </div>
    `
  }

  /*

    Функция генерирует html код квиза и возвращает его в виде строки

    @param props (object) - принимает объект { className }
      * className - класс квиза
    @return (string) - возвращает html строку квиза

  */
  _htmlQuiz(props) {
    const { className } = props

    return `
      <div class="${className}">
        ${this._htmlHead()}
        <div class="${this._clsNotSelector('body')}">
          <div class="${this._clsNotSelector('templates')}"></div>
        </div>
        ${this._htmlFooter()}
      </div>
    `
  }

  /*

    Функция генерирует html код пагинации

    @return (string) - возвращает html строку пагинации

  */
  _htmlPagination() {
    const {
      visible: isPagination,
      className: prefix,
      classNameBullet,
      classNameText,
    } = this._options.pagination

    if (!isPagination) return ''

    const classNamePagination = this._clsNotSelector(prefix) + ' ' + prefix

    function renderBullet(className) {
      return `
        <span class="${className}"></span>
      `
    }

    return `
      <div class="${classNamePagination}">
        <div class="${this._clsNotSelector(classNameText, prefix)}">
          Шаг ${this.activeIndex + 1} из ${this.questionLength}
        </div>
        <div class="${this._clsNotSelector('stages', prefix)}">
          ${[...this._options.questions].reduce(
            (acc, current) =>
              acc + renderBullet(this._clsNotSelector(classNameBullet, prefix)),
            ''
          )}
        </div>
      </div>
    `
  }

  /*

    Функция генерирует html код шапки квиза

    @return (string) - возвращает html строку шапки квиза

  */
  _htmlHead() {
    const {
      visible: isHead,
      className: clsHead,
      name: nameHead,
    } = this._options.head

    if (!isHead) return ''

    return `
      <div class="${this._clsNotSelector(clsHead)}">
        <span class="${this._clsNotSelector('quiz-name')}">${nameHead}</span>
      </div>
    `
  }

  /*

    Функция генерирует html код подвала квиза

    @return (string) - возвращает html строку подвала квиза

  */
  _htmlFooter() {
    const { className: clsFooter } = this._options.footer
    const { text: warningText, className: clsWarning } = this._options.warning

    return `
      <div class="${this._clsNotSelector(clsFooter)}">
        ${this._htmlPagination()}
        <div class="${this._clsNotSelector(clsWarning)}">
          ${warningText}
        </div>
        ${this._htmlNavigation()}
      </div>
    `
  }

  /*

    Функция генерирует html код навигации квиза

    @return (string) - возвращает html строку навигации квиза

  */
  _htmlNavigation() {
    const {
      visible: isNavigation,
      classNameButton,
      classNameButtonNext,
      classNameButtonPrev,
      renderNextButton,
      renderPrevButton,
    } = this._options.navigation

    if (!isNavigation) return ''

    const renderButtonNext = () => {
      const className = this._clsNotSelector(
        classNameButton + ' ' + classNameButtonNext
      )

      const callback = this._callbackRender(renderNextButton, {
        className,
      })

      if (callback) {
        return callback
      }

      return `
        <div class="${className}">
          <span>Далее</span>
          <i>
            <svg
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 6.90228H11M11 6.90228L6 1.40228M11 6.90228L6 12.5977"
                stroke-width="1.2" />
            </svg>
          </i>
        </div>
      `
    }

    const renderButtonPrev = () => {
      const className = this._clsNotSelector(
        `${classNameButton} ${classNameButtonPrev}`
      )

      const callback = this._callbackRender(renderPrevButton, {
        className,
      })

      if (callback) {
        return callback
      }

      return `
        <div class="${className}">
          <i>
            <svg
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 6.5L1 6.5M1 6.5L6 12M1 6.5L6 0.804557"
                stroke-width="1.2" />
            </svg>
          </i>
          <span>Назад</span>
        </div>
      `
    }

    return `
      <div class="${this._clsNotSelector('wrapper-buttons')}">
        ${renderButtonPrev()}
        ${renderButtonNext()}
      </div>
    `
  }

  /*

    Вспомогательная пользовательская HoC функция реализации логики типов ответов

    @param render (function) - функция, возвращающая html строку
    @param props (object) - объект аргументов для функции render
      * name - наименование ответа
      * ball - балл ответа
      * prefix - префикс для класса (по неймингу БЭМ)
      * index - номер ответа
      * number - номер вопроса
    @return (string) - возвращает результат вызова функции render (html строку ответа)

  */
  withHtmlTypeAnswers(render, props) {
    const { name, ball: userBall, prefix, index, number: idQuestion } = props

    if (this._isEmpty(name)) return ''

    const ball = this._isEmpty(userBall)
      ? this.getQuestionDefaultBall(idQuestion)
      : userBall

    const state = this.getStateQuestionAnswer(name)
    const isChecked = !this._isEmpty(state) ? state.checked : false

    const value = `${idQuestion}-${index}-${ball}`

    return render({ prefix, idQuestion, value, name, isChecked })
  }

  /*

    Функция генерации html строки ответов типа checkbox

    @param props (object) - объект аргументов
      * prefix - префикс для класса (по неймингу БЭМ)
      * idQuestion - номер вопроса
      * value - значение ответа
      * name - наименование ответа
      * isChecked - состояние ответа
    @return (string) - возвращает html строку ответа

  */
  _htmlTypeAnswersCheckbox({ prefix, idQuestion, value, name, isChecked }) {
    return `
      <label
        class="wrapper-checkbox ${prefix}__wrapper-checkbox">
        <input
          class="wrapper-checkbox__input"
          type="checkbox"
          name="question${idQuestion}"
          value="${value}"
          data-name="${name}"
          ${isChecked ? `checked="checked"` : ''}
        />
        <div class="wrapper-checkbox__wrapper">
          <span class="wrapper-checkbox__squard"></span>
          <span class="wrapper-checkbox__name">${name}</span>
        </div>
      </label>
    `
  }

  /*

    Функция генерации html строки ответов типа radio

    @param props (object) - объект аргументов
      * prefix - префикс для класса (по неймингу БЭМ)
      * idQuestion - номер вопроса
      * value - значение ответа
      * name - наименование ответа
      * isChecked - состояние ответа
    @return (string) - возвращает html строку ответа

  */
  _htmlTypeAnswersRadio({ prefix, idQuestion, value, name, isChecked }) {
    return `
      <label
        class="wrapper-radio ${prefix}__wrapper-radio">
        <input
          class="wrapper-radio__radio"
          type="radio"
          name="question${idQuestion}"
          value="${value}"
          data-name="${name}"
          ${isChecked ? `checked="checked"` : ''}
        />
        <div class="wrapper-radio__wrapper">
          <span class="wrapper-radio__circle"></span>
          <span class="wrapper-radio__name">${name}</span>
        </div>
      </label>
    `
  }

  /*

    Функция обработчик типов вопросов и их ответов. 
    Генерирует html строку ответов вопроса исходя из типа вопроса

    @param props (object) - объект аргументов
      * type - тип вопроса
      * index - номер вопроса
      * prefix - префикс для класса (по неймингу БЭМ)
    @return (string) - возвращает html строку ответов на вопрос

  */
  _switchTypeQuestion(props) {
    const { type, answers, index: number, prefix } = props

    const current = this._typesAnswers.find((_type) => _type.name === type)

    if (this._isEmpty(current)) {
      return this._handleError({
        level: 0,
        codeError: 'TYPE_ANSWERS_NULL',
        message: type,
        functionName: '_switchTypeQuestion(props)',
      })
    }

    const isPrefix = current['prefix']
    const classNameContainer = current['className']

    // Все варианты ответов одного вопроса
    const renderContent = [...answers].reduce((acc, currentAnswer, index) => {
      const { name, ball } = currentAnswer

      const render = current['render'].bind(this)

      const _props = {
        name,
        ball,
        index,
        prefix,
        number,
      }

      const renderAnswer = this.withHtmlTypeAnswers(render, _props)

      return acc + renderAnswer
    }, '')

    const className = isPrefix
      ? this._clsNotSelector(classNameContainer, prefix)
      : classNameContainer

    return `
      <div class="${className}">
        ${renderContent}
      </div>
    `
  }

  /*

    Функция обработчик вопроса 
    Генерирует html строку вопроса и ответов вопроса

    @param props (object) - объект аргументов
      * question - объект вопроса
      * index - номер вопроса
      * prefix - префикс для класса (по неймингу БЭМ)
    @return (string) - возвращает html строку вопроса с ответами

  */
  _htmlQuestion({ question: dataQuestion, index, prefix }) {
    const { question, type: userType, answers } = dataQuestion

    if (this._isEmpty(question) || this._isEmpty(answers)) return ''

    const type = userType ?? 'radio'

    if (question.length === 0 || answers.length === 0) {
      return this._handleError({
        level: 0,
        codeError: 'QUESTION_FAIL',
        message: index,
        functionName: '_htmlQuestion(props)',
      })
    }

    const htmlAnswers = this._switchTypeQuestion({
      type,
      answers,
      index,
      prefix,
    })

    return `
      <div class="${this._clsNotSelector('wrapper-title', prefix)}">
        <div class="${this._clsNotSelector('title', prefix)}">
          ${question}
        </div>
      </div>
      ${htmlAnswers}
    `
  }

  /*

    Функция генерации html строки шаблона 'selects'

    @param props (object) - объект аргументов
      * className - префикс для класса (по неймингу БЭМ)
    @return (string) - возвращает html строку шаблона 'selects'

  */
  _htmlTemplateSelects({ className: prefix }) {
    const firstQuestionId = this.activeIndex

    const firstQuestion = this._options.questions[firstQuestionId]
    const htmlQuestion = this._htmlQuestion({
      question: firstQuestion,
      index: firstQuestionId,
      prefix,
    })

    return htmlQuestion
  }

  /*

    Функция генерации html строки шаблона 'results'

    @param props (object) - объект аргументов
      * className - префикс для класса (по неймингу БЭМ)
    @return (string) - возвращает html строку шаблона 'results'

  */
  _htmlTemplateResults({ className: prefix }) {
    if (!this._options.footer.lastVisible) {
      this.setHiddenFooter()
    }

    this.balls.current = this.calcResultsBall()
    const result = this.calcCompareBall(this.balls.current)

    if (this._isEmpty(result)) {
      this._handleError({
        level: 0,
        codeError: 'NULL_RESULT',
        functionName: '_htmlTemplateResults(props)',
      })
    }

    const { title, index: indexResult } = result

    if (this._isEmpty(title)) {
      this._handleError({
        level: 0,
        codeError: 'NULL_RESULT_TITLE',
        message: indexResult,
        functionName: '_htmlTemplateResults(props)',
      })

      return ''
    }

    const callback = this._callbackRender(this._options.renderResults, {
      prefix,
      title,
      balls: this.balls,
    })

    if (callback) {
      return callback
    }

    return `
      <div class="${this._clsNotSelector('text-result', prefix)}">
        <span>
          ${title}
        </span>
      </div>
    `
  }

  /*

    Пользовательская функция получение всех выбранных ответов текущего вопроса

    @return (string, boolean) - возвращает объект с массивом ответов видом { answers: [] }
    Возвращает False, если квиз не инициализирован

  */
  getSelectedAnswers() {
    if (!this._Init) return false

    const inputs = this.template.querySelectorAll(`
        input[name="question${this.activeIndex}"]:checked
      `)

    return inputs.length !== 0
      ? {
          answers: [...inputs].map((input) => {
            const { ball } = this.formatValue(input.value)

            return {
              name: input.dataset.name ? input.dataset.name : null,
              ball,
              checked: true,
            }
          }),
        }
      : {
          answers: [],
        }
  }

  /*

    Пользовательская функция приведение значения input к развернутому формату

    @param value (string) - значение input
    @return (object, boolean) - возвращает объект с ключами
      * questionId - номер вопроса
      * answerId - номер ответа на вопрос
      * ball - кол-во баллов за ответ
    Возвращает False, если квиз не инициализирован

  */
  formatValue(value) {
    if (!this._Init) return false

    if (value.indexOf('-') !== -1) {
      const arrValues = value.split('-')

      return {
        questionId: Number.parseInt(arrValues[0]),
        answerId: Number.parseInt(arrValues[1]),
        ball: Number.parseInt(arrValues[2]),
      }
    }

    return value
  }

  /*

    Пользовательская функция управления отображением элементов предупреждения и его содержимым

    @param state (boolean) - если true, отображение предупреждения. Если false, скрытие предупреждения.
    @param content (string) - передаваемое сообщение предупреждения.
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setWarning(state = true, content = this._options.warning.text) {
    if (!this._Init) return false

    const classNameActive = this._options.warning.classNameActive

    if (state) {
      if (this.warning.innerHTML !== content) {
        this.warning.innerHTML = content
      }

      this.warning.classList.add(this._clsNotSelector(classNameActive))
    } else {
      this.warning.classList.remove(this._clsNotSelector(classNameActive))
    }

    return true
  }

  /*

    Пользовательская функция управления отображением модального окна

    @param state (boolean) - если true, отображение окна. Если false, скрытие окна.
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setModal(state = true) {
    if (!this._Init) return false

    if (this._options.init.modal) {
      if (state) {
        this.modal.classList.add(this._options.modal.classNameActive)
      } else {
        this.modal.classList.remove(this._options.modal.classNameActive)
      }
    }

    return true
  }

  /*

    Пользовательская функция управления отображением подвалом квиза

    @param state (boolean) - если true, отображение подвала. Если false, скрытие подвала.
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setHiddenFooter(state = true) {
    if (!this._Init) return false

    const className = this._clsNotSelector(this._options.footer.classNameHidden)

    if (state) {
      this.footer.classList.add(className)
    } else {
      this.footer.classList.remove(className)
    }

    return true
  }

  /*

    Пользовательская функция устанавливает текст пагинации (счетчик)

    @param id (number) - номер текущего шага
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setPaginationText(id) {
    if (!this._Init) return false

    this.paginationText.innerHTML = `Шаг ${id + 1} из ${this.questionLength}`

    return true
  }

  /*

    Пользовательская функция устанавливает прогресс пагинации

    @param id (number) - номер текущего шага
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setPaginationBullets(id) {
    if (!this._Init) return false

    const { className: prefix, classNameBulletActive } =
      this._options.pagination

    // Текстуры
    this.paginationBullets.forEach((bullet, _id) => {
      if (_id <= id) {
        bullet.classList.add(
          this._clsNotSelector(classNameBulletActive, prefix)
        )
      } else {
        bullet.classList.remove(
          this._clsNotSelector(classNameBulletActive, prefix)
        )
      }
    })

    return true
  }

  /*

    Пользовательская функция устанавливает указанный вопрос по номеру (id)

    @param id (number) - номер вопроса
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setQuestion(id) {
    if (!this._Init) return false

    this.activeIndex = id
    const currentQuestion = this._options.questions[id]

    const activeTemplate = this._templates[this.activeIndexTemplate]
    const activeTemplateClassName = activeTemplate['className']

    const htmlQuestion = this._htmlQuestion({
      question: currentQuestion,
      index: id,
      prefix: activeTemplateClassName,
    })

    this.template.innerHTML = htmlQuestion

    if (this._options.pagination.visible) {
      this.setPaginationBullets(id)
      this.setPaginationText(id)
    }

    this._callFuncCallback(this._Callbacks.questionChange, {
      id,
    })

    return true
  }

  /*

    Пользовательская функция устанавливает текущую позицию вопроса относительно его расположения

    @param action (string) - тип действия
      * next - следующий вопрос
      * prev - предыдущий вопрос
    @return (boolean) - результат выполнения функции
    Возвращает False, если квиз не инициализирован

  */
  setPositionQuestion(action = 'next') {
    if (!this._Init) return false

    const state = {
      max: this.questionLength - 1,
      current: this.activeIndex,
      next: this.activeIndex + 1,
      prev: this.activeIndex - 1,
    }

    switch (action) {
      case 'next': {
        // Следующий вопрос
        if (state.next <= state.max) {
          const isRequired = this.isRequiredQuestion(state.current)

          if (isRequired) {
            const isValidQuestion = this.isStateQuestionAnswer(state.current)

            if (isValidQuestion) {
              this._callFuncCallback(this._Callbacks.questionNext, {
                id: state.next,
              })

              this.setWarning(false)
              this.setQuestion(state.next)
            } else {
              this.setWarning(true, this._options.warning.textRequired)
            }
          } else {
            this.setQuestion(state.next)
          }
        }

        // Последний вопрос
        if (state.current === state.max - 1) {
          this._callFuncCallback(this._Callbacks.questionLast, {
            id: this.activeIndex,
          })
        }

        // Последний вопрос (переключение с последнего)
        if (state.next > state.max) {
          if (this._options.requiredField) {
            const isValidate = this.isStateAnswerResults()

            if (isValidate) {
              this._callFuncCallback(this._Callbacks.questionLastEnd)

              this.setWarning(false)
              this.setTemplate('results')
            } else {
              return this.setWarning(true, this._options.warning.text)
            }
          } else {
            this.setTemplate('results')
          }
        }

        break
      }
      case 'prev': {
        // Предыдущий вопрос
        if (state.prev >= 0 && this.activeIndex !== 0) {
          this._callFuncCallback(this._Callbacks.questionPrev, {
            id: state.prev,
          })

          this.setQuestion(state.prev)
        }

        // Первый вопрос
        if (this.activeIndex === 0) {
          this._callFuncCallback(this._Callbacks.questionFirst, {
            id: this.activeIndex,
          })
        }

        break
      }
      default: {
        return this._handleError({
          level: 0,
          codeError: 'NOT_POSITION',
          message: action,
          functionName: 'setPositionQuestion(action)',
        })
      }
    }

    return true
  }

  /*

    Пользовательская функция проверки на обязательный вопрос по id

    @param id (number) - номер вопроса
    @return (boolean) - возвращает true, если вопрос обязательный. False - если вопрос не обязателен.

  */
  isRequiredQuestion(id) {
    const { required: userRequired } = this._options.questions[id]

    return this._isEmpty(userRequired) ? false : userRequired
  }

  /*

    Пользовательская функция возвращает объект типа вопроса по его имени

    @param name (string) - имя типа вопроса
    @return (boolean, object, undefined) - возвращает объект найденного типа вопроса
    Возвразает undefined, если тип вопроса не найден
    Возвращает False, если квиз не инициализирован

  */
  getQuestionTypeObject(name) {
    if (!this._Init) return false

    return [...this._typesAnswers].find((type) => type.name === name)
  }

  /*

    Пользовательская функция получение значение у вопроса балла по умолчанию (если не выбран ответ)

    @param id (number) - номер вопроса
    @return (number) - балл по умолчанию

  */
  getQuestionDefaultBall(id) {
    const { defaultBall } = this._options.questions[id]

    return this._isEmpty(defaultBall) ? this._defaultBall : defaultBall
  }

  /*

    Вспомогательная функция валидации опций добавления (шаблонов, типов)
    Возвращает массив из валидированных объектов

    @param props (object) - аргументы функции
      * arrayFilters - массив из валидационных объектов
      * validKey - обязательные ключи
      * validationKeys - массив из объектов правил валидации и сообщений ошибок
      * prefixError - префикс для сообщений ошибок
    @return (array) - возвращает массив прошедших валидацию объектов

  */
  _getValidArrayHeplerAdd({
    arrayFilters,
    validKey,
    validationKeys,
    prefixError,
  }) {
    return [...arrayFilters].filter((objItem, index) => {
      const isNoValidKey = this._isNoValidObject(objItem, validKey)

      if (isNoValidKey.length !== 0) {
        const message = `У объекта с index ${index} в массиве опции ${prefixError} отсуствуют следующие поля: { ${isNoValidKey.join(
          ', '
        )} }`

        return this._handleError({
          level: 1,
          message,
        })
      }

      const isError = [...validationKeys].some(
        (objValidKey) =>
          this._withFuncValidType(
            objValidKey['function'],
            objItem[objValidKey['key']],
            objValidKey['message'].replace('%i%', index)
          ) === false
      )

      if (isError) return false

      const getRenderValue = objItem['render']()

      if (typeof getRenderValue !== 'string') {
        const message = `У объекта с index ${index} в массиве опции ${prefixError} значение опции render должно быть типа function и возвращать данные типа string`

        return this._handleError({
          level: 1,
          message,
        })
      }

      return true
    })
  }

  /*

    Функция добавления пользовательских шаблонов к шаблоном по умолчанию

    @param arrayTemplates (array) - массив пользовательских шаблонов
    @return (boolean) - результат выполнения функции

  */
  _addTemplates(arrayTemplates) {
    const validKey = ['name', 'className', 'render']
    const messageErrorPrefix = 'templates'

    const validationKeys = [
      {
        key: 'name',
        function: this._isString,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции name должно быть типа string`,
      },
      {
        key: 'className',
        function: this._isString,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции className должно быть типа string`,
      },
      {
        key: 'render',
        function: this._isFunction,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции render должно быть типа function`,
      },
    ]

    const optionsValidateFunction = {
      arrayFilters: arrayTemplates,
      validKey,
      validationKeys,
      prefixError: messageErrorPrefix,
    }

    const addTemplates = this._getValidArrayHeplerAdd(optionsValidateFunction)

    if (addTemplates.length > 0) {
      this._templates = [...this._templates, ...addTemplates]

      return true
    }

    return false
  }

  /*

    Функция добавления пользовательских типов вопросов к типам вопросов по умолчанию

    @param arrayTypes (array) - массив пользовательских типов вопросов
    @return (boolean) - результат выполнения функции

  */
  _addTypes(arrayTypes) {
    const validKey = ['name', 'prefix', 'className', 'render']
    const messageErrorPrefix = 'types'

    const validationKeys = [
      {
        key: 'name',
        function: this._isString,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции name должно быть типа string`,
      },
      {
        key: 'className',
        function: this._isString,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции className должно быть типа string`,
      },
      {
        key: 'prefix',
        function: this._isBoolean,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции prefix должно быть типа boolean`,
      },
      {
        key: 'render',
        function: this._isFunction,
        message: `У объекта с index %i% в массиве опции ${messageErrorPrefix} значение опции render должно быть типа function`,
      },
    ]

    const optionsValidateFunction = {
      arrayFilters: arrayTypes,
      validKey,
      validationKeys,
      prefixError: messageErrorPrefix,
    }

    const addTypes = this._getValidArrayHeplerAdd(optionsValidateFunction)

    if (addTypes.length > 0) {
      this._typesAnswers = [...this._typesAnswers, ...addTypes]

      return true
    }

    return false
  }

  /*

    Пользовательская функция проверяет существование указанному типу вопроса по его имени

    @param name (string) - имя типа вопроса
    @return (boolean) - результат выполнения функции

  */
  // isQuestionType(name) {
  //   return this._typesAnswers[name] !== undefined
  // }

  /*

    Пользовательская функция возвращает список всех типов ответов

    @param name (string) - имя типа вопроса
    @return (boolean, array) - возвращает массив объектов типов вопросов
    Возвращает False, если квиз не инициализирован

  */
  getAnswerTypes() {
    if (!this._Init) return false

    return [...this._typesAnswers]
  }

  /*

    Пользовательская функция устанавливает шаблон по его имени

    @param name (string) - имя шаблона
    @return (boolean) - результат выполнения функции

  */
  setTemplate(name) {
    const currentId = this._templates.findIndex(
      (template) => template.name === name
    )

    if (currentId === -1) {
      return this._handleError({
        level: 1,
        codeError: 'TEMPLATE_NULL',
        message: name,
        functionName: 'setTemplate(name)',
      })
    }

    this.activeIndexTemplate = currentId
    const current = this._templates[currentId]

    const fnRenderContent = current['render'].bind(this)

    if (fnRenderContent) {
      const template = document.createElement('div')
      const className =
        this._clsPrefix(
          'template template--active',
          this._options.prefix,
          false
        ) + ` ${current['className']}`

      template.className = className

      template.innerHTML = fnRenderContent({
        className: current['className'],
      })

      this.templates.innerHTML = ''
      this.templates.appendChild(template)

      this.template = template

      this._callFuncCallback(this._Callbacks.templateChange, {
        id: currentId,
        name: name,
        content: template,
      })

      return true
    }

    return false
  }

  /*

    Пользовательская функция возвращает текущий шаблон и его index

    @return (object) - объект, состоящий из номера шаблона и его объекта

  */
  getTemplate() {
    return {
      current: this._templates[this.activeIndexTemplate],
      index: this.activeIndexTemplate,
    }
  }

  /*

    Пользовательская функция возвращает список всех шаблонов

    @return (object) - массив объектов шаблонов

  */
  getTemplates() {
    if (!this._Init) return false

    return [...this._templates]
  }

  /*

    Пользовательская функция проверяет существование указанного шаблона по его имени

    @return (boolean) - результат выполнения функции

  */
  // isTemplate(name) {
  //   return this._templates[name] !== undefined
  // }

  /*

    Пользовательская функция проверяет, установлен в момент вызова указанный шаблон по его имени

    @return (boolean) - результат выполнения функции

  */
  isCurrentTemplate(name) {
    const { current } = this.getTemplate()

    const { name: currentName } = current

    return name === currentName
  }
}
